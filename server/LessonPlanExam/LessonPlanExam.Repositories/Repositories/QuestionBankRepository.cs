using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.DTOs.QuestionBankDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using Microsoft.EntityFrameworkCore;

namespace LessonPlanExam.Repositories.Repositories
{
	public class QuestionBankRepository : IQuestionBankRepository
	{
		private readonly LessonPlanExamDbContext _db;

		public QuestionBankRepository(LessonPlanExamDbContext db)
		{
			_db = db;
		}

		public async Task<QuestionBank> CreateAsync(CreateQuestionBankRequest request, CancellationToken ct = default)
		{
			var entity = new QuestionBank
			{
				Name = request.Name,
				GradeLevel = request.GradeLevel,
				TeacherId = request.TeacherId,
				Description = request.Description,
				StatusEnum = EQuestionBankStatus.Draft,
				CreatedAt = DateTime.UtcNow,
				UpdatedAt = DateTime.UtcNow
			};
			_db.QuestionBanks.Add(entity);
			await _db.SaveChangesAsync(ct);
			return entity;
		}

		public async Task<QuestionBank> UpdateAsync(int id, UpdateQuestionBankRequest request, CancellationToken ct = default)
		{
			var entity = await _db.QuestionBanks.FirstOrDefaultAsync(x => x.Id == id, ct);
			if (entity == null) return null;
			entity.Name = request.Name;
			entity.GradeLevel = request.GradeLevel;
			entity.Description = request.Description;
			entity.UpdatedAt = DateTime.UtcNow;
			await _db.SaveChangesAsync(ct);
			return entity;
		}

		public async Task<QuestionBank> UpdateStatusAsync(int id, EQuestionBankStatus status, CancellationToken ct = default)
		{
			var entity = await _db.QuestionBanks.FirstOrDefaultAsync(x => x.Id == id, ct);
			if (entity == null) return null;
			entity.StatusEnum = status;
			entity.UpdatedAt = DateTime.UtcNow;
			await _db.SaveChangesAsync(ct);
			return entity;
		}

		public Task<QuestionBank> GetByIdAsync(int id, CancellationToken ct = default)
		{
			return _db.QuestionBanks.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
		}

		public async Task<(IEnumerable<QuestionBankListItem> Items, int TotalCount)> QueryAsync(int? teacherId, int? gradeLevel, EQuestionBankStatus? status, string q, int page, int size, CancellationToken ct = default)
		{
			var query = _db.QuestionBanks.AsNoTracking().AsQueryable();
			if (teacherId.HasValue) query = query.Where(x => x.TeacherId == teacherId.Value);
			if (gradeLevel.HasValue) query = query.Where(x => x.GradeLevel == gradeLevel.Value);
			if (status.HasValue) query = query.Where(x => x.StatusEnum == status.Value);
			if (!string.IsNullOrWhiteSpace(q))
			{
				var qn = q.Trim().ToLower();
				query = query.Where(x => x.Name.ToLower().Contains(qn) || x.Description.ToLower().Contains(qn));
			}

			var count = await query.CountAsync(ct);
			var items = await query
				.OrderByDescending(x => x.CreatedAt)
				.Skip((page - 1) * size)
				.Take(size)
				.Select(x => new QuestionBankListItem
				{
					Id = x.Id,
					Name = x.Name,
					GradeLevel = x.GradeLevel,
					TeacherId = x.TeacherId,
					StatusEnum = x.StatusEnum,
					CreatedAt = x.CreatedAt,
					TotalQuestions = _db.Questions.Count(qr => qr.QuestionBankId == x.Id)
				})
				.ToListAsync(ct);

			return (items, count);
		}

		public async Task<QuestionBankStatsResponse> GetStatsAsync(int id, CancellationToken ct = default)
		{
			var baseQuery = _db.Questions.AsNoTracking().Where(x => x.QuestionBankId == id && (x.IsActive ?? true));
			var total = await baseQuery.CountAsync(ct);

			var byType = await baseQuery
				.GroupBy(x => x.QuestionTypeEnum)
				.Select(g => new { Key = g.Key.ToString(), Cnt = g.Count() })
				.ToDictionaryAsync(x => x.Key, x => x.Cnt, ct);

			var byDifficulty = await baseQuery
				.GroupBy(x => x.QuestionDifficultyId)
				.Select(g => new { Key = (g.Key.HasValue ? g.Key.Value.ToString() : "null"), Cnt = g.Count() })
				.ToDictionaryAsync(x => x.Key, x => x.Cnt, ct);

			var byDomain = await _db.QuestionDifficulties.AsNoTracking()
				.Join(baseQuery, d => d.Id, q => q.QuestionDifficultyId, (d, q) => d.Domain)
				.GroupBy(x => x)
				.Select(g => new { Key = g.Key ?? "", Cnt = g.Count() })
				.ToDictionaryAsync(x => x.Key, x => x.Cnt, ct);

			return new QuestionBankStatsResponse
			{
				TotalQuestions = total,
				ByType = byType,
				ByDifficulty = byDifficulty,
				ByDomain = byDomain
			};
		}

		public async Task<int> ImportAsync(ImportQuestionBankItemsRequest request, CancellationToken ct = default)
		{
			var bank = await _db.QuestionBanks.FirstOrDefaultAsync(x => x.Id == request.QuestionBankId, ct);
			if (bank == null) return 0;

			int inserted = 0;
			foreach (var item in request.Items)
			{
				var q = new Question
				{
					QuestionBankId = bank.Id,
					QuestionDifficultyId = item.QuestionDifficultyId,
					Title = item.Title,
					Content = item.Content,
					QuestionTypeEnum = item.QuestionTypeEnum,
					AdditionalData = string.IsNullOrWhiteSpace(item.AdditionalData) ? "{}" : item.AdditionalData,
					IsActive = true,
					CreatedAt = DateTime.UtcNow,
					UpdatedAt = DateTime.UtcNow
				};
				_db.Questions.Add(q);
				await _db.SaveChangesAsync(ct);

				if (item.QuestionTypeEnum == EQuestionType.MultipleChoice && item.MultipleChoiceAnswers != null)
				{
					foreach (var ans in item.MultipleChoiceAnswers)
					{
						_db.QuestionMultipleChoiceAnswers.Add(new QuestionMultipleChoiceAnswer
						{
							QuestionId = q.Id,
							AnswerText = ans.AnswerText,
							IsCorrect = ans.IsCorrect,
							Explanation = ans.Explanation,
							OrderIndex = ans.OrderIndex ?? 0,
							CreatedAt = DateTime.UtcNow
						});
					}
				}
				else if (item.QuestionTypeEnum == EQuestionType.FillBlank && item.FillBlankAnswers != null)
				{
					foreach (var ans in item.FillBlankAnswers)
					{
						_db.QuestionFillBlankAnswers.Add(new QuestionFillBlankAnswer
						{
							QuestionId = q.Id,
							CorrectAnswer = ans.CorrectAnswer,
							NormalizedCorrectAnswer = string.IsNullOrWhiteSpace(ans.NormalizedCorrectAnswer) ? ans.CorrectAnswer?.Trim().ToLower() : ans.NormalizedCorrectAnswer,
							Explanation = ans.Explanation,
							CreatedAt = DateTime.UtcNow
						});
					}
				}

				await _db.SaveChangesAsync(ct);
				inserted++;
			}

			return inserted;
		}

		public async Task<IEnumerable<object>> ExportAsync(int id, CancellationToken ct = default)
		{
			var questions = await _db.Questions.AsNoTracking().Where(x => x.QuestionBankId == id)
				.Select(x => new
				{
					x.Id,
					x.Title,
					x.Content,
					x.QuestionTypeEnum,
					x.QuestionDifficultyId,
					MultipleChoiceAnswers = _db.QuestionMultipleChoiceAnswers
						.Where(a => a.QuestionId == x.Id)
						.OrderBy(a => a.OrderIndex)
						.Select(a => new { a.AnswerText, a.IsCorrect, a.Explanation, a.OrderIndex }),
					FillBlankAnswers = _db.QuestionFillBlankAnswers
						.Where(a => a.QuestionId == x.Id)
						.Select(a => new { a.CorrectAnswer, a.NormalizedCorrectAnswer, a.Explanation })
				})
				.ToListAsync(ct);

			return questions;
		}
	}
}

