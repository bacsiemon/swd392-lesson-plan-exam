using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.DTOs.ExamDTOs;
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
    public class ExamRepository : IExamRepository
    {
        private readonly LessonPlanExamDbContext _db;

        public ExamRepository(LessonPlanExamDbContext db)
        {
            _db = db;
        }

        public async Task<Exam> CreateExamAsync(ExamCreateRequest request, CancellationToken ct = default)
        {
            var entity = new Exam
            {
                Title = request.Title,
                Description = request.Description,
                CreatedByTeacher = request.CreatedByTeacher,
                GradeLevel = request.GradeLevel,
                DurationMinutes = request.DurationMinutes ?? 60,
                PassThreshold = request.PassThreshold,
                ShowResultsImmediately = request.ShowResultsImmediately,
                ShowCorrectAnswers = request.ShowCorrectAnswers,
                RandomizeQuestions = request.RandomizeQuestions,
                RandomizeAnswers = request.RandomizeAnswers,
                ScoringMethodEnum = request.ScoringMethodEnum,
                MaxAttempts = request.MaxAttempts,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                StatusEnum = request.StatusEnum ?? EExamStatus.Draft,
                ExamMatrixId = request.ExamMatrixId,
                TotalQuestions = request.TotalQuestions,
                TotalPoints = request.TotalPoints,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (!string.IsNullOrEmpty(request.Password))
            {
                // Password hashing should be handled by calling service; repository stores provided hash in request.Password field
                entity.PasswordHash = request.Password;
            }

            await _db.Exams.AddAsync(entity, ct);
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<Exam> CreateExamFromMatrixAsync(ExamFromMatrixRequest request, CancellationToken ct = default)
        {
            // Load matrix and items
            var matrix = await _db.ExamMatrices.Include(m => m.ExamMatrixItems).FirstOrDefaultAsync(m => m.Id == request.ExamMatrixId, ct);
            if (matrix == null)
            {
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] Matrix not found: ExamMatrixId={request.ExamMatrixId}");
                return null;
            }
            
            if (matrix.ExamMatrixItems == null || !matrix.ExamMatrixItems.Any())
            {
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] Matrix has no items: ExamMatrixId={request.ExamMatrixId}");
                // Still create exam but without questions
            }

            var entity = new Exam
            {
                Title = string.IsNullOrEmpty(request.Title) ? matrix.Name : request.Title,
                Description = string.IsNullOrEmpty(request.Description) ? matrix.Description : request.Description,
                CreatedByTeacher = request.CreatedByTeacher,
                GradeLevel = request.GradeLevel,
                DurationMinutes = request.DurationMinutes ?? 60,
                PassThreshold = request.PassThreshold,
                ShowResultsImmediately = request.ShowResultsImmediately,
                ShowCorrectAnswers = request.ShowCorrectAnswers,
                RandomizeQuestions = request.RandomizeQuestions ?? true,
                RandomizeAnswers = request.RandomizeAnswers,
                ScoringMethodEnum = request.ScoringMethodEnum,
                MaxAttempts = request.MaxAttempts,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                StatusEnum = EExamStatus.Draft,
                ExamMatrixId = request.ExamMatrixId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (!string.IsNullOrEmpty(request.Password))
            {
                entity.PasswordHash = request.Password;
            }

            await _db.Exams.AddAsync(entity, ct);
            await _db.SaveChangesAsync(ct);

            // Collect selected questions per matrix item
            var selectedQuestions = new List<(Question q, decimal? points)>();

            System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] MatrixId={request.ExamMatrixId}, MatrixItems count={matrix.ExamMatrixItems?.Count ?? 0}");

            foreach (var item in matrix.ExamMatrixItems)
            {
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ===== Processing item: ItemId={item.Id} =====");
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}, QuestionBankId={item.QuestionBankId}, Domain='{item.Domain}', DifficultyLevel={item.DifficultyLevel}, QuestionCount={item.QuestionCount}");

                // First, check if there are ANY questions in the bank (without filters)
                var allQuestionsInBank = await _db.Questions.AsNoTracking()
                    .Where(q => q.QuestionBankId == item.QuestionBankId && (q.IsActive ?? true))
                    .CountAsync(ct);
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Total active questions in bank {item.QuestionBankId}: {allQuestionsInBank}");

                // Use same query structure as ValidateMatrixAsync for consistency
                var qQuery = _db.Questions.AsNoTracking()
                    .Include(q => q.QuestionDifficulty)
                    .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                (q.IsActive ?? true));

                // IMPORTANT: Filter logic priority:
                // 1. If DifficultyLevel (QuestionDifficultyId) is specified, use it (Domain is already determined by QuestionDifficulty)
                // 2. If only Domain is specified (no DifficultyLevel), filter by Domain
                // 3. Domain in matrix item is mainly for reference/display, not for filtering when DifficultyLevel is present
                
                // Filter by DifficultyLevel (which is QuestionDifficultyId in ExamMatrixItem)
                // This is the primary filter - if present, it determines both difficulty and domain
                if (item.DifficultyLevel.HasValue)
                {
                    qQuery = qQuery.Where(q => q.QuestionDifficultyId == item.DifficultyLevel.Value);
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Filtered by DifficultyLevel (QuestionDifficultyId): {item.DifficultyLevel.Value}");
                    
                    // Debug: Check how many questions have this difficulty
                    var questionsWithDifficulty = await _db.Questions.AsNoTracking()
                        .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                    (q.IsActive ?? true) &&
                                    q.QuestionDifficultyId == item.DifficultyLevel.Value)
                        .CountAsync(ct);
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Questions with DifficultyLevel {item.DifficultyLevel.Value}: {questionsWithDifficulty}");
                    
                    // Debug: Show what domain this difficulty has
                    var difficultyInfo = await _db.QuestionDifficulties.AsNoTracking()
                        .FirstOrDefaultAsync(d => d.Id == item.DifficultyLevel.Value, ct);
                    if (difficultyInfo != null)
                    {
                        System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: QuestionDifficulty {item.DifficultyLevel.Value} has Domain: '{difficultyInfo.Domain}', Matrix item Domain: '{item.Domain}'");
                    }
                }
                // Only filter by Domain if DifficultyLevel is NOT specified
                // When DifficultyLevel is present, Domain is already determined by the QuestionDifficulty
                else if (!string.IsNullOrEmpty(item.Domain))
                {
                    var domainValue = item.Domain.Trim();
                    // Try exact match first (most efficient)
                    qQuery = qQuery.Where(q => q.QuestionDifficulty != null && 
                        q.QuestionDifficulty.Domain != null && 
                        q.QuestionDifficulty.Domain == domainValue);
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Filtered by Domain only (no DifficultyLevel): '{domainValue}'");
                    
                    // Debug: Check how many questions have this domain (before filtering)
                    var questionsWithDomain = await _db.Questions.AsNoTracking()
                        .Include(q => q.QuestionDifficulty)
                        .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                    (q.IsActive ?? true) &&
                                    q.QuestionDifficulty != null &&
                                    q.QuestionDifficulty.Domain != null)
                        .Select(q => new { q.Id, Domain = q.QuestionDifficulty.Domain })
                        .ToListAsync(ct);
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Questions with domains in bank: {questionsWithDomain.Count}");
                    if (questionsWithDomain.Any())
                    {
                        var distinctDomains = questionsWithDomain.Select(q => q.Domain).Distinct().ToList();
                        System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Available domains: [{string.Join(", ", distinctDomains.Select(d => $"'{d}'"))}]");
                        System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Looking for domain: '{domainValue}'");
                        var matchingDomains = questionsWithDomain.Where(q => q.Domain?.Trim() == domainValue).ToList();
                        System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Questions with matching domain (after Trim): {matchingDomains.Count}");
                    }
                }
                
                // Debug: Log the query before execution
                var queryString = qQuery.ToQueryString();
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Query: {queryString}");

                var list = await qQuery.ToListAsync(ct);
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Found {list?.Count ?? 0} questions after SQL filtering");
                
                // If no questions found and domain filter was applied (but no DifficultyLevel), try filtering in memory
                // This handles cases where domain has whitespace that SQL comparison might miss
                // Note: Only do this if DifficultyLevel is NOT specified, because if it is, Domain is already determined
                if ((list == null || list.Count == 0) && !string.IsNullOrEmpty(item.Domain) && !item.DifficultyLevel.HasValue)
                {
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: No questions found with SQL filter, trying in-memory filter with Trim()...");
                    var domainValue = item.Domain.Trim();
                    
                    // Build query without domain filter for in-memory filtering
                    var inMemoryQuery = _db.Questions.AsNoTracking()
                        .Include(q => q.QuestionDifficulty)
                        .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                    (q.IsActive ?? true) &&
                                    q.QuestionDifficulty != null &&
                                    q.QuestionDifficulty.Domain != null);
                    
                    var questionsList = await inMemoryQuery.ToListAsync(ct);
                    list = questionsList.Where(q => 
                        q.QuestionDifficulty != null && 
                        q.QuestionDifficulty.Domain != null &&
                        q.QuestionDifficulty.Domain.Trim() == domainValue).ToList();
                    
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Found {list?.Count ?? 0} questions after in-memory filtering");
                }
                
                // Debug: Log details of found questions
                if (list != null && list.Count > 0)
                {
                    foreach (var q in list.Take(5)) // Log first 5
                    {
                        System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Question {q.Id}: DifficultyId={q.QuestionDifficultyId}, Domain='{q.QuestionDifficulty?.Domain}'");
                    }
                }

                if (list == null || list.Count == 0)
                {
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] WARNING: No questions found for item ItemId={item.Id}, QuestionBankId={item.QuestionBankId}, Domain='{item.Domain}', DifficultyLevel={item.DifficultyLevel}. Skipping this item.");
                    continue;
                }

                // Shuffle in memory
                var rnd = new Random();
                var shuffled = list.OrderBy(x => rnd.Next()).ToList();
                var take = Math.Min(item.QuestionCount, shuffled.Count);
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Taking {take} questions from {shuffled.Count} available (requested {item.QuestionCount})");
                
                for (int i = 0; i < take; i++)
                {
                    var q = shuffled[i];
                    decimal? points = item.PointsPerQuestion;
                    selectedQuestions.Add((q, points));
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ItemId={item.Id}: Added question QuestionId={q.Id}, QuestionDifficultyId={q.QuestionDifficultyId}, Domain={q.QuestionDifficulty?.Domain}, Points={points}");
                }
            }

            System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] Total selected questions before deduplication: {selectedQuestions.Count}");

            // Remove duplicates by question id
            var distinct = selectedQuestions.GroupBy(x => x.q.Id).Select(g => g.First()).ToList();

            // Determine points allocation
            decimal? totalPoints = request.TotalPoints ?? matrix.TotalPoints;
            int totalQuestions = distinct.Count;
            decimal assignedPointsSum = distinct.Where(x => x.points.HasValue).Sum(x => x.points.Value);
            int remainingCount = distinct.Count(x => !x.points.HasValue);
            decimal defaultPoint = 1m;

            if (totalPoints.HasValue)
            {
                if (remainingCount > 0)
                {
                    var remaining = totalPoints.Value - assignedPointsSum;
                    if (remaining < 0) remaining = 0;
                    defaultPoint = remainingCount > 0 ? Math.Floor((remaining / remainingCount) * 100) / 100 : 1m; // round to 2 decimals
                }
                else
                {
                    defaultPoint = 0m;
                }
            }

            // Add exam questions with order index
            int order = 1;
            System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] Adding {distinct.Count} distinct questions to exam");
            
            foreach (var item in distinct)
            {
                var q = item.q;
                var pts = item.points ?? defaultPoint;
                var examQ = new ExamQuestion
                {
                    ExamId = entity.Id,
                    QuestionId = q.Id,
                    OrderIndex = order++,
                    Points = pts,
                    CreatedAt = DateTime.UtcNow
                };
                _db.ExamQuestions.Add(examQ);
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] Added ExamQuestion: ExamId={entity.Id}, QuestionId={q.Id}, OrderIndex={examQ.OrderIndex}, Points={pts}");
            }

            // Compute totals
            entity.TotalQuestions = totalQuestions;
            entity.TotalPoints = await _db.ExamQuestions.Where(x => x.ExamId == entity.Id).SumAsync(x => x.Points ?? 0, ct);
            
            System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] Exam totals: TotalQuestions={totalQuestions}, TotalPoints={entity.TotalPoints}");

            await _db.SaveChangesAsync(ct);

            // Reload entity with ExamQuestions and Question navigation properties
            // This ensures all navigation properties are loaded correctly
            var reloadedEntity = await _db.Exams
                .Include(e => e.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
                        .ThenInclude(q => q.QuestionDifficulty)
                .FirstOrDefaultAsync(e => e.Id == entity.Id, ct);
            
            if (reloadedEntity == null)
            {
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ERROR: Failed to reload exam after creation. ExamId={entity.Id}");
                return entity; // Return original entity as fallback
            }
            
            System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] Final ExamQuestions count: {reloadedEntity.ExamQuestions?.Count ?? 0}");
            
            if (reloadedEntity.ExamQuestions != null && reloadedEntity.ExamQuestions.Any())
            {
                foreach (var eq in reloadedEntity.ExamQuestions.Take(5))
                {
                    System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] ExamQuestion: Id={eq.Id}, QuestionId={eq.QuestionId}, OrderIndex={eq.OrderIndex}, Points={eq.Points}");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"[CreateExamFromMatrix] WARNING: No ExamQuestions loaded after creation!");
            }
            
            return reloadedEntity;
        }

        public async Task<IEnumerable<Exam>> GetExamsByTeacherAsync(int? teacherId, EExamStatus? status, string q, CancellationToken ct = default)
        {
            var query = _db.Exams.AsNoTracking().AsQueryable();
            if (teacherId.HasValue) query = query.Where(x => x.CreatedByTeacher == teacherId.Value);
            if (status.HasValue) query = query.Where(x => x.StatusEnum == status.Value);
            if (!string.IsNullOrWhiteSpace(q))
            {
                var qq = q.ToLower();
                query = query.Where(x => x.Title.ToLower().Contains(qq) || x.Description.ToLower().Contains(qq));
            }
            return await query.OrderByDescending(x => x.Id).ToListAsync(ct);
        }

        public async Task<Exam> GetExamWithQuestionsAsync(int id, CancellationToken ct = default)
        {
            // Use Include to load ExamQuestions and Question in one query
            // Include QuestionDifficulty to match CreateExamFromMatrixAsync behavior
            // Place AsNoTracking() before Include() for better compatibility
            var exam = await _db.Exams
                .AsNoTracking()
                .Include(e => e.ExamQuestions)
                    .ThenInclude(eq => eq.Question)
                        .ThenInclude(q => q.QuestionDifficulty)
                .FirstOrDefaultAsync(x => x.Id == id, ct);
            
            if (exam == null) return null;
            
            // Debug logging
            var examQuestionsCount = exam.ExamQuestions?.Count ?? 0;
            System.Diagnostics.Debug.WriteLine($"[GetExamWithQuestionsAsync] ExamId: {id}, ExamQuestions count: {examQuestionsCount}");
            
            if (exam.ExamQuestions != null && exam.ExamQuestions.Any())
            {
                foreach (var eq in exam.ExamQuestions.Take(5))
                {
                    System.Diagnostics.Debug.WriteLine($"[GetExamWithQuestionsAsync] ExamQuestion: Id={eq.Id}, ExamId={eq.ExamId}, QuestionId={eq.QuestionId}, OrderIndex={eq.OrderIndex}, Points={eq.Points}, HasQuestion={eq.Question != null}");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"[GetExamWithQuestionsAsync] WARNING: No ExamQuestions found for ExamId: {id}");
            }
            
            return exam;
        }

        public async Task<Exam> UpdateExamAsync(int id, ExamUpdateRequest request, CancellationToken ct = default)
        {
            var entity = await _db.Exams.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return null;
            entity.Title = request.Title;
            entity.Description = request.Description;
            entity.DurationMinutes = request.DurationMinutes ?? entity.DurationMinutes;
            entity.GradeLevel = request.GradeLevel;
            entity.PassThreshold = request.PassThreshold;
            entity.ShowResultsImmediately = request.ShowResultsImmediately;
            entity.ShowCorrectAnswers = request.ShowCorrectAnswers;
            entity.RandomizeQuestions = request.RandomizeQuestions;
            entity.RandomizeAnswers = request.RandomizeAnswers;
            entity.ScoringMethodEnum = request.ScoringMethodEnum;
            entity.MaxAttempts = request.MaxAttempts;
            entity.StartTime = request.StartTime;
            entity.EndTime = request.EndTime;
            entity.UpdatedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(request.Password))
            {
                entity.PasswordHash = request.Password;
            }
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<bool> UpdateExamStatusAsync(int id, EExamStatus status, CancellationToken ct = default)
        {
            var entity = await _db.Exams.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return false;
            entity.StatusEnum = status;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<ExamQuestion> AddExamQuestionAsync(int examId, ExamQuestionAddRequest request, CancellationToken ct = default)
        {
            var exam = await _db.Exams.FirstOrDefaultAsync(e => e.Id == examId, ct);
            if (exam == null) return null;
            int orderIndex = request.OrderIndex ?? (_db.ExamQuestions.Where(x => x.ExamId == examId).Max(x => (int?)x.OrderIndex) ?? 0) + 1;
            var entity = new ExamQuestion
            {
                ExamId = examId,
                QuestionId = request.QuestionId,
                OrderIndex = orderIndex,
                Points = request.Points,
                CreatedAt = DateTime.UtcNow
            };
            await _db.ExamQuestions.AddAsync(entity, ct);
            await _db.SaveChangesAsync(ct);
            
            // Load Question navigation property using Include, similar to GetExamWithQuestionsAsync
            await _db.Entry(entity).Reference(x => x.Question).LoadAsync(ct);
            
            return entity;
        }

        public async Task<ExamQuestion> UpdateExamQuestionAsync(int examQuestionId, ExamQuestionAddRequest request, CancellationToken ct = default)
        {
            var entity = await _db.ExamQuestions.FirstOrDefaultAsync(x => x.Id == examQuestionId, ct);
            if (entity == null) return null;
            entity.Points = request.Points ?? entity.Points;
            if (request.OrderIndex.HasValue) entity.OrderIndex = request.OrderIndex.Value;
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<bool> DeleteExamQuestionAsync(int examQuestionId, CancellationToken ct = default)
        {
            var entity = await _db.ExamQuestions.FirstOrDefaultAsync(x => x.Id == examQuestionId, ct);
            if (entity == null) return false;
            _db.ExamQuestions.Remove(entity);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<IEnumerable<PreviewQuestionItem>> PreviewRandomAsync(int matrixId, decimal? totalPoints, CancellationToken ct = default)
        {
            var matrix = await _db.ExamMatrices.Include(m => m.ExamMatrixItems).FirstOrDefaultAsync(m => m.Id == matrixId, ct);
            if (matrix == null) return null;

            var selected = new List<(Question q, decimal? points)>();
            foreach (var item in matrix.ExamMatrixItems)
            {
                var qQuery = _db.Questions.AsNoTracking().Include(q => q.QuestionDifficulty)
                    .Where(q => q.QuestionBankId == item.QuestionBankId && (q.IsActive ?? true));
                if (!string.IsNullOrEmpty(item.Domain))
                    qQuery = qQuery.Where(q => q.QuestionDifficulty != null && q.QuestionDifficulty.Domain == item.Domain);
                if (item.DifficultyLevel.HasValue)
                    qQuery = qQuery.Where(q => q.QuestionDifficultyId == item.DifficultyLevel.Value);
                var list = await qQuery.ToListAsync(ct);
                if (list == null || list.Count == 0) continue;
                var rnd = new Random();
                var shuffled = list.OrderBy(x => rnd.Next()).Take(item.QuestionCount).ToList();
                foreach (var q in shuffled)
                {
                    selected.Add((q, item.PointsPerQuestion));
                }
            }

            // allocate points if totalPoints specified
            decimal assignedSum = selected.Where(x => x.points.HasValue).Sum(x => x.points.Value);
            int remaining = selected.Count(x => !x.points.HasValue);
            decimal defaultPoint = 1m;
            if (totalPoints.HasValue)
            {
                var rem = totalPoints.Value - assignedSum;
                if (remaining > 0) defaultPoint = Math.Floor((rem / remaining) * 100) / 100;
                else defaultPoint = 0m;
            }

            var result = selected.GroupBy(x => x.q.Id).Select((g, idx) => new PreviewQuestionItem
            {
                QuestionId = g.Key,
                Title = g.First().q.Title,
                Content = g.First().q.Content,
                QuestionTypeEnum = (int)g.First().q.QuestionTypeEnum,
                Points = g.First().points ?? defaultPoint
            }).ToList();

            return result;
        }

        public async Task<int> GetStudentAttemptCountAsync(int examId, int studentId, CancellationToken ct = default)
        {
            return await _db.ExamAttempts.CountAsync(x => x.ExamId == examId && x.StudentId == studentId, ct);
        }
    }
}
