using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.QuestionBankDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace LessonPlanExam.Services.Services
{
	public class QuestionBankService : IQuestionBankService
	{
		private readonly IQuestionBankRepository _repo;
		private readonly ILogger<QuestionBankService> _logger;

		public QuestionBankService(IQuestionBankRepository repo, ILogger<QuestionBankService> logger)
		{
			_repo = repo;
			_logger = logger;
		}

		public async Task<BaseResponse<QuestionBankResponse>> CreateAsync(CreateQuestionBankRequest request)
		{
			var entity = await _repo.CreateAsync(request);
			return new BaseResponse<QuestionBankResponse>
			{
				StatusCode = 201,
				Message = "SUCCESS",
				Data = new QuestionBankResponse
				{
					Id = entity.Id,
					Name = entity.Name,
					GradeLevel = entity.GradeLevel,
					TeacherId = entity.TeacherId,
					Description = entity.Description,
					StatusEnum = entity.StatusEnum,
					CreatedAt = entity.CreatedAt,
					UpdatedAt = entity.UpdatedAt
				}
			};
		}

		public async Task<BaseResponse<QuestionBankResponse>> UpdateAsync(int id, UpdateQuestionBankRequest request)
		{
			var entity = await _repo.UpdateAsync(id, request);
			if (entity == null)
			{
				return new BaseResponse<QuestionBankResponse>
				{
					StatusCode = 400,
					Errors = "INVALID_QUESTION_BANK_ID"
				};
			}
			return new BaseResponse<QuestionBankResponse>
			{
				StatusCode = 200,
				Message = "SUCCESS",
				Data = new QuestionBankResponse
				{
					Id = entity.Id,
					Name = entity.Name,
					GradeLevel = entity.GradeLevel,
					TeacherId = entity.TeacherId,
					Description = entity.Description,
					StatusEnum = entity.StatusEnum,
					CreatedAt = entity.CreatedAt,
					UpdatedAt = entity.UpdatedAt
				}
			};
		}

		public async Task<BaseResponse<QuestionBankResponse>> UpdateStatusAsync(int id, UpdateQuestionBankStatusRequest request)
		{
			var entity = await _repo.UpdateStatusAsync(id, request.StatusEnum);
			if (entity == null)
			{
				return new BaseResponse<QuestionBankResponse>
				{
					StatusCode = 400,
					Errors = "INVALID_QUESTION_BANK_ID"
				};
			}
			return new BaseResponse<QuestionBankResponse>
			{
				StatusCode = 200,
				Message = "SUCCESS",
				Data = new QuestionBankResponse
				{
					Id = entity.Id,
					Name = entity.Name,
					GradeLevel = entity.GradeLevel,
					TeacherId = entity.TeacherId,
					Description = entity.Description,
					StatusEnum = entity.StatusEnum,
					CreatedAt = entity.CreatedAt,
					UpdatedAt = entity.UpdatedAt
				}
			};
		}

		public async Task<BaseResponse<QuestionBankResponse>> GetByIdAsync(int id)
		{
			var entity = await _repo.GetByIdAsync(id);
			if (entity == null)
			{
				return new BaseResponse<QuestionBankResponse>
				{
					StatusCode = 400,
					Errors = "INVALID_QUESTION_BANK_ID"
				};
			}
			return new BaseResponse<QuestionBankResponse>
			{
				StatusCode = 200,
				Message = "SUCCESS",
				Data = new QuestionBankResponse
				{
					Id = entity.Id,
					Name = entity.Name,
					GradeLevel = entity.GradeLevel,
					TeacherId = entity.TeacherId,
					Description = entity.Description,
					StatusEnum = entity.StatusEnum,
					CreatedAt = entity.CreatedAt,
					UpdatedAt = entity.UpdatedAt
				}
			};
		}

		public async Task<BaseResponse> QueryAsync(int? teacherId, int? gradeLevel, EQuestionBankStatus? status, string q, int page, int size)
		{
			if (page <= 0 || size <= 0)
			{
				return new BaseResponse { StatusCode = 400, Errors = "INVALID_PAGINATION" };
			}
			var (items, total) = await _repo.QueryAsync(teacherId, gradeLevel, status, q, page, size);
			var totalPages = (int)Math.Ceiling(total / (double)size);
			return new BaseResponse
			{
				StatusCode = 200,
				Message = "SUCCESS",
				Data = items,
				AdditionalData = new { Size = size, Page = page, Total = total, TotalPages = totalPages }
			};
		}

		public async Task<BaseResponse<QuestionBankStatsResponse>> GetStatsAsync(int id)
		{
			var stats = await _repo.GetStatsAsync(id);
			return new BaseResponse<QuestionBankStatsResponse>
			{
				StatusCode = 200,
				Message = "SUCCESS",
				Data = stats
			};
		}

		public async Task<BaseResponse<object>> ImportAsync(ImportQuestionBankItemsRequest request)
		{
			var inserted = await _repo.ImportAsync(request);
			return new BaseResponse<object>
			{
				StatusCode = 201,
				Message = "SUCCESS",
				Data = new { Inserted = inserted }
			};
		}

		public async Task<BaseResponse<IEnumerable<object>>> ExportAsync(int id)
		{
			var data = await _repo.ExportAsync(id);
			return new BaseResponse<IEnumerable<object>>
			{
				StatusCode = 200,
				Message = "SUCCESS",
				Data = data
			};
		}
	}
}

