using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.DTOs.ExamMatrixDTOs;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Repositories
{
    public class ExamMatrixRepository : Base.GenericRepository<ExamMatrix>, IExamMatrixRepository
    {
        private readonly LessonPlanExamDbContext _db;

        public ExamMatrixRepository(LessonPlanExamDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<ExamMatrix> CreateMatrixAsync(ExamMatrixCreateRequest request, CancellationToken ct = default)
        {
            var entity = new ExamMatrix
            {
                Name = request.Name,
                Description = request.Description,
                TeacherId = request.TeacherId,
                TotalQuestions = request.TotalQuestions,
                TotalPoints = request.TotalPoints,
                Configuration = request.Configuration,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _db.ExamMatrices.AddAsync(entity, ct);
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<ExamMatrix> UpdateMatrixAsync(int id, ExamMatrixUpdateRequest request, CancellationToken ct = default)
        {
            var entity = await _db.ExamMatrices.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return null;

            entity.Name = request.Name;
            entity.Description = request.Description;
            entity.TotalQuestions = request.TotalQuestions;
            entity.TotalPoints = request.TotalPoints;
            entity.Configuration = request.Configuration;
            entity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<ExamMatrix> GetMatrixWithItemsAsync(int id, CancellationToken ct = default)
        {
            var matrix = await _db.ExamMatrices.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, ct);
            if (matrix == null) return null;

            await _db.Entry(matrix).Collection(x => x.ExamMatrixItems).LoadAsync(ct);
            return matrix;
        }

        public async Task<IEnumerable<ExamMatrix>> GetMatricesByTeacherAsync(int? teacherId, string q, CancellationToken ct = default)
        {
            var query = _db.ExamMatrices.AsNoTracking().AsQueryable();

            if (teacherId.HasValue)
                query = query.Where(x => x.TeacherId == teacherId.Value);

            if (!string.IsNullOrEmpty(q))
            {
                var searchTerm = q.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(searchTerm) || 
                                         x.Description.ToLower().Contains(searchTerm));
            }

            return await query.OrderByDescending(x => x.Id).ToListAsync(ct);
        }

        public async Task<ExamMatrixItem> CreateMatrixItemAsync(int matrixId, ExamMatrixItemCreateRequest request, CancellationToken ct = default)
        {
            var entity = new ExamMatrixItem
            {
                ExamMatrixId = matrixId,
                QuestionBankId = request.QuestionBankId,
                Domain = request.Domain,
                DifficultyLevel = request.DifficultyLevel,
                QuestionCount = request.QuestionCount,
                PointsPerQuestion = request.PointsPerQuestion,
                CreatedAt = DateTime.UtcNow
            };
            await _db.ExamMatrixItems.AddAsync(entity, ct);
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<ExamMatrixItem> UpdateMatrixItemAsync(int itemId, ExamMatrixItemUpdateRequest request, CancellationToken ct = default)
        {
            var entity = await _db.ExamMatrixItems.FirstOrDefaultAsync(x => x.Id == itemId, ct);
            if (entity == null) return null;

            entity.QuestionBankId = request.QuestionBankId;
            entity.Domain = request.Domain;
            entity.DifficultyLevel = request.DifficultyLevel;
            entity.QuestionCount = request.QuestionCount;
            entity.PointsPerQuestion = request.PointsPerQuestion;

            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<bool> DeleteMatrixItemAsync(int itemId, CancellationToken ct = default)
        {
            var entity = await _db.ExamMatrixItems.FirstOrDefaultAsync(x => x.Id == itemId, ct);
            if (entity == null) return false;

            _db.ExamMatrixItems.Remove(entity);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<bool> DeleteMatrixAsync(int id, CancellationToken ct = default)
        {
            var entity = await _db.ExamMatrices.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return false;
            _db.ExamMatrices.Remove(entity);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<ValidationResponse> ValidateMatrixAsync(int matrixId, CancellationToken ct = default)
        {
            var response = new ValidationResponse { Ok = true, Shortages = new List<ShortageInfo>() };
            var matrix = await GetMatrixWithItemsAsync(matrixId, ct);
            if (matrix == null) return response;

            System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] MatrixId={matrixId}, Items count={matrix.ExamMatrixItems?.Count ?? 0}");

            foreach (var item in matrix.ExamMatrixItems)
            {
                System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ===== Processing item: ItemId={item.Id} =====");
                System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}, QuestionBankId={item.QuestionBankId}, Domain='{item.Domain}', DifficultyLevel={item.DifficultyLevel}, QuestionCount={item.QuestionCount}");

                // Query available questions in the bank
                // Use same query structure as CreateExamFromMatrixAsync for consistency
                var query = _db.Questions.AsNoTracking()
                    .Include(q => q.QuestionDifficulty)
                    .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                (q.IsActive ?? true));

                // Check bank status
                var bank = await _db.QuestionBanks.AsNoTracking()
                    .FirstOrDefaultAsync(b => b.Id == item.QuestionBankId, ct);
                
                if (bank?.StatusEnum != null && bank.StatusEnum != EQuestionBankStatus.Active)
                {
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: QuestionBank {item.QuestionBankId} is not Active (Status={bank.StatusEnum})");
                    response.Shortages.Add(new ShortageInfo
                    {
                        ItemId = item.Id,
                        Needed = item.QuestionCount,
                        Available = 0
                    });
                    response.Ok = false;
                    continue;
                }

                // First, check if there are ANY questions in the bank (without filters)
                var allQuestionsInBank = await _db.Questions.AsNoTracking()
                    .Where(q => q.QuestionBankId == item.QuestionBankId && (q.IsActive ?? true))
                    .CountAsync(ct);
                System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Total active questions in bank {item.QuestionBankId}: {allQuestionsInBank}");

                // IMPORTANT: Filter logic priority (same as CreateExamFromMatrixAsync):
                // 1. If DifficultyLevel (QuestionDifficultyId) is specified, use it (Domain is already determined by QuestionDifficulty)
                // 2. If only Domain is specified (no DifficultyLevel), filter by Domain
                // 3. Domain in matrix item is mainly for reference/display, not for filtering when DifficultyLevel is present
                
                // Filter by DifficultyLevel (which is QuestionDifficultyId in ExamMatrixItem)
                // This is the primary filter - if present, it determines both difficulty and domain
                if (item.DifficultyLevel.HasValue)
                {
                    query = query.Where(q => q.QuestionDifficultyId == item.DifficultyLevel.Value);
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Filtered by DifficultyLevel (QuestionDifficultyId): {item.DifficultyLevel.Value}");
                    
                    // Debug: Check how many questions have this difficulty
                    var questionsWithDifficulty = await _db.Questions.AsNoTracking()
                        .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                    (q.IsActive ?? true) &&
                                    q.QuestionDifficultyId == item.DifficultyLevel.Value)
                        .CountAsync(ct);
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Questions with DifficultyLevel {item.DifficultyLevel.Value}: {questionsWithDifficulty}");
                    
                    // Debug: Show what domain this difficulty has
                    var difficultyInfo = await _db.QuestionDifficulties.AsNoTracking()
                        .FirstOrDefaultAsync(d => d.Id == item.DifficultyLevel.Value, ct);
                    if (difficultyInfo != null)
                    {
                        System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: QuestionDifficulty {item.DifficultyLevel.Value} has Domain: '{difficultyInfo.Domain}', Matrix item Domain: '{item.Domain}'");
                    }
                }
                // Only filter by Domain if DifficultyLevel is NOT specified
                // When DifficultyLevel is present, Domain is already determined by the QuestionDifficulty
                else if (!string.IsNullOrEmpty(item.Domain))
                {
                    var domainValue = item.Domain.Trim();
                    // Check null for both QuestionDifficulty and Domain (same as CreateExamFromMatrixAsync)
                    query = query.Where(q => q.QuestionDifficulty != null && 
                        q.QuestionDifficulty.Domain != null && 
                        q.QuestionDifficulty.Domain == domainValue);
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Filtered by Domain only (no DifficultyLevel): '{domainValue}'");
                    
                    // Debug: Check how many questions have this domain
                    var questionsWithDomain = await _db.Questions.AsNoTracking()
                        .Include(q => q.QuestionDifficulty)
                        .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                    (q.IsActive ?? true) &&
                                    q.QuestionDifficulty != null &&
                                    q.QuestionDifficulty.Domain != null)
                        .Select(q => new { q.Id, Domain = q.QuestionDifficulty.Domain })
                        .ToListAsync(ct);
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Questions with domains in bank: {questionsWithDomain.Count}");
                    if (questionsWithDomain.Any())
                    {
                        var distinctDomains = questionsWithDomain.Select(q => q.Domain).Distinct().ToList();
                        System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Available domains: [{string.Join(", ", distinctDomains.Select(d => $"'{d}'"))}]");
                        System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Looking for domain: '{domainValue}'");
                        var matchingDomains = questionsWithDomain.Where(q => q.Domain?.Trim() == domainValue).ToList();
                        System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Questions with matching domain (after Trim): {matchingDomains.Count}");
                    }
                }

                var available = await query.CountAsync(ct);
                System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Available questions after SQL filtering: {available}");

                // If no questions found and domain filter was applied (but no DifficultyLevel), try filtering in memory
                // This handles cases where domain has whitespace that SQL comparison might miss
                // Note: Only do this if DifficultyLevel is NOT specified, because if it is, Domain is already determined
                if (available == 0 && !string.IsNullOrEmpty(item.Domain) && !item.DifficultyLevel.HasValue)
                {
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: No questions found with SQL filter, trying in-memory filter with Trim()...");
                    var domainValue = item.Domain.Trim();
                    
                    // Build query without domain filter for in-memory filtering
                    var inMemoryQuery = _db.Questions.AsNoTracking()
                        .Include(q => q.QuestionDifficulty)
                        .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                    (q.IsActive ?? true) &&
                                    q.QuestionDifficulty != null &&
                                    q.QuestionDifficulty.Domain != null);
                    
                    var questionsList = await inMemoryQuery.ToListAsync(ct);
                    var filteredQuestions = questionsList.Where(q => 
                        q.QuestionDifficulty != null && 
                        q.QuestionDifficulty.Domain != null &&
                        q.QuestionDifficulty.Domain.Trim() == domainValue).ToList();
                    
                    available = filteredQuestions.Count;
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Available questions after in-memory filtering: {available}");
                }

                System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: Final available questions: {available}, Needed: {item.QuestionCount}");

                if (available < item.QuestionCount)
                {
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: SHORTAGE - Available={available}, Needed={item.QuestionCount}");
                    response.Shortages.Add(new ShortageInfo
                    {
                        ItemId = item.Id,
                        Needed = item.QuestionCount,
                        Available = available
                    });
                    response.Ok = false;
                } else {
                    System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] ItemId={item.Id}: OK - Available={available} >= Needed={item.QuestionCount}");
                }
            }

            System.Diagnostics.Debug.WriteLine($"[ValidateMatrixAsync] Final result: Ok={response.Ok}, Shortages count={response.Shortages.Count}");
            return response;
        }
    }
}

