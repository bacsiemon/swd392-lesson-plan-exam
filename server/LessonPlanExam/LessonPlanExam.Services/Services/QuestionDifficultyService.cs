using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.QuestionDifficultyDTOs;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Services
{
    public class QuestionDifficultyService : IQuestionDifficultyService
    {
        private readonly IQuestionDifficultyRepository _repo;

        public QuestionDifficultyService(IQuestionDifficultyRepository repo)
        {
            _repo = repo;
        }

        public async Task<BaseResponse<QuestionDifficultyResponse>> CreateAsync(CreateQuestionDifficultyRequest request)
        {
            var entity = await _repo.CreateAsync(request);
            return new BaseResponse<QuestionDifficultyResponse>
            {
                StatusCode = 201,
                Message = "SUCCESS",
                Data = new QuestionDifficultyResponse
                {
                    Id = entity.Id,
                    Domain = entity.Domain,
                    DifficultyLevel = entity.DifficultyLevel,
                    Description = entity.Description
                }
            };
        }

        public async Task<BaseResponse<QuestionDifficultyResponse>> UpdateAsync(int id, UpdateQuestionDifficultyRequest request)
        {
            var entity = await _repo.UpdateAsync(id, request);
            if (entity == null)
            {
                return new BaseResponse<QuestionDifficultyResponse>
                {
                    StatusCode = 400,
                    Errors = "INVALID_DIFFICULTY_ID"
                };
            }
            return new BaseResponse<QuestionDifficultyResponse>
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = new QuestionDifficultyResponse
                {
                    Id = entity.Id,
                    Domain = entity.Domain,
                    DifficultyLevel = entity.DifficultyLevel,
                    Description = entity.Description
                }
            };
        }

        public async Task<BaseResponse> DeleteAsync(int id)
        {
            var ok = await _repo.DeleteAsync(id);
            if (!ok)
            {
                return new BaseResponse { StatusCode = 400, Errors = "INVALID_OR_IN_USE_DIFFICULTY_ID" };
            }
            return new BaseResponse { StatusCode = 200, Message = "SUCCESS" };
        }

        public async Task<BaseResponse<QuestionDifficultyResponse>> GetByIdAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null)
            {
                return new BaseResponse<QuestionDifficultyResponse> { StatusCode = 400, Errors = "INVALID_DIFFICULTY_ID" };
            }
            return new BaseResponse<QuestionDifficultyResponse>
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = new QuestionDifficultyResponse
                {
                    Id = entity.Id,
                    Domain = entity.Domain,
                    DifficultyLevel = entity.DifficultyLevel,
                    Description = entity.Description
                }
            };
        }

        public async Task<BaseResponse> QueryAsync(string domain, int? difficultyLevel, int page, int size)
        {
            if (page <= 0 || size <= 0) return new BaseResponse { StatusCode = 400, Errors = "INVALID_PAGINATION" };
            var (items, total) = await _repo.QueryAsync(domain, difficultyLevel, page, size);
            var totalPages = (int)Math.Ceiling(total / (double)size);
            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = items,
                AdditionalData = new { Size = size, Page = page, Total = total, TotalPages = totalPages }
            };
        }
    }
}
