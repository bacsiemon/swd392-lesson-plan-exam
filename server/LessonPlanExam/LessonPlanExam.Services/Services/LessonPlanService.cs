using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.FileUploadDTOs;
using LessonPlanExam.Repositories.DTOs.LessonPlanDTOs;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using LinqKit;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace LessonPlanExam.Services.Services
{
    public class LessonPlanService : ILessonPlanService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAccountService _accountService;
        private readonly IFileUploadService _fileUploadService;

        public LessonPlanService(IUnitOfWork unitOfWork, IAccountService accountService, IFileUploadService fileUploadService)
        {
            _unitOfWork = unitOfWork;
            _accountService = accountService;
            _fileUploadService = fileUploadService;
        }

        public async Task<BaseResponse> CreateLessonPlanAsync(CreateLessonPlanRequest request)
        {
            // Get current user ID from JWT token via AccountService
            var currentRole = _accountService.GetCurrentUserRole();
            if (currentRole != Repositories.Enums.EUserRole.Teacher)
            {
                return new BaseResponse
                {
                    StatusCode = 401,
                    Errors = "TEACHER_ONLY"
                };
            }
            var currentUserId = _accountService.GetCurrentUserId();
            
            var lessonPlan = request.ToEntity();
            
            // Override the CreatedByTeacher with the current user ID from JWT
            // This ensures that the lesson plan is created by the authenticated user
            lessonPlan.CreatedByTeacher = currentUserId;
            
            _unitOfWork.LessonPlanRepository.Create(lessonPlan);
            await _unitOfWork.SaveChangesAsync();

            return new BaseResponse
            {
                StatusCode = 201,
                Message = "SUCCESS",
                Data = lessonPlan.ToResponse()
            };
        }

        public async Task<BaseResponse> GetLessonPlanByIdAsync(int id)
        {
            // Using strongly typed include for GetByIdAsync
            var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(
                id,
                e => e.LessonPlanFiles
            );

            if (lessonPlan == null || lessonPlan.DeletedAt != null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "LESSON_PLAN_NOT_FOUND"
                };
            }

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = lessonPlan.ToResponse()
            };
        }

        public async Task<BaseResponse> GetByCurrentTeacherAsync(int page, int size)
        {
            // Get current user ID from JWT token via AccountService
            var currentUserId = _accountService.GetCurrentUserId();

            // Using strongly typed includes for filtering by teacher
            var response = await _unitOfWork.LessonPlanRepository.GetPaginatedAsync(
                page,
                size,
                firstPage: 1,
                predicate: lp => lp.CreatedByTeacher == currentUserId && lp.DeletedAt == null,
                orderBy: q => q.OrderByDescending(x => x.CreatedAt),
                includeProperties: lp => lp.CreatedByTeacherNavigation
            );
            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = response.Items.Select(e => e.ToResponse()),
                AdditionalData = response.AdditionalData
            };
        }

        public async Task<BaseResponse> SearchAsync(string? title, string? teacherName, int? gradeLevel, int page = 1, int size = 10)
        {
            var predicate = PredicateBuilder.New<LessonPlan>(e => e.DeletedAt == null);
            
            if (!string.IsNullOrEmpty(title))
            {
                predicate = predicate.And(e => EF.Functions.ILike(e.Title, $"%{title}%"));
            }
            
            if (!string.IsNullOrEmpty(teacherName))
            {
                predicate = predicate.And(e => EF.Functions.ILike(e.CreatedByTeacherNavigation.Account.FullName, $"%{teacherName}%"));
            }
            
            if (gradeLevel.HasValue)
            {
                predicate = predicate.And(e => e.GradeLevel == gradeLevel.Value);
            }

            var searchResult = await _unitOfWork.LessonPlanRepository.SearchAsync(predicate, page, size);

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = searchResult.Items.Select(e => e.ToResponse()),
                AdditionalData = searchResult.AdditionalData
            };
        }


        public async Task<BaseResponse> UpdateLessonPlanAsync(int id, UpdateLessonPlanRequest request)
        {
            var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(id);
            
            if (lessonPlan == null || lessonPlan.DeletedAt != null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "LESSON_PLAN_NOT_FOUND"
                };
            }

            lessonPlan.UpdateFromRequest(request);
            _unitOfWork.LessonPlanRepository.Update(lessonPlan);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties for response using strongly typed include
            var updatedLessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(
                id, 
                new Expression<Func<LessonPlan, object>>[] { lp => lp.CreatedByTeacherNavigation }
            );

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = updatedLessonPlan.ToResponse()
            };
        }

        public async Task<BaseResponse> DeleteLessonPlanAsync(int id)
        {
            var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(id);
            
            if (lessonPlan == null || lessonPlan.DeletedAt != null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "LESSON_PLAN_NOT_FOUND"
                };
            }

            // Soft delete by setting DeletedAt timestamp
            lessonPlan.DeletedAt = DateTime.UtcNow;
            _unitOfWork.LessonPlanRepository.Update(lessonPlan);
            await _unitOfWork.SaveChangesAsync();

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS"
            };
        }

        public async Task<BaseResponse<FileUploadResponse>> UploadFileAsync(int lessonPlanId, IFormFile file)
        {
            // Check if lesson plan exists
            var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(lessonPlanId);
            if (lessonPlan == null || lessonPlan.DeletedAt != null)
            {
                return new BaseResponse<FileUploadResponse>
                {
                    StatusCode = 404,
                    Errors = "LESSON_PLAN_NOT_FOUND"
                };
            }

            // Upload the file using FileUploadService
            var fileUploadResponse = await _fileUploadService.UploadFileAsync(file);
            if (fileUploadResponse.StatusCode != 201)
            {
                return fileUploadResponse;
            }

            // Create LessonPlanFile record to link the uploaded file to the lesson plan
            var lessonPlanFile = new LessonPlanFile
            {
                LessonPlanId = lessonPlanId,
                FileUrl = fileUploadResponse.Data.FileUrl,
                UpdatedAt = DateTime.UtcNow
            };

            _unitOfWork.LessonPlanFileRepository.Create(lessonPlanFile);
            await _unitOfWork.SaveChangesAsync();

            return new BaseResponse<FileUploadResponse>
            {
                StatusCode = 201,
                Message = "SUCCESS",
                Data = fileUploadResponse.Data
            };
        }

        public async Task<BaseResponse> DeleteLessonPlanFileAsync(int fileId)
        {
            var lessonPlanFile = await _unitOfWork.LessonPlanFileRepository.GetByIdAsync(fileId);
            
            if (lessonPlanFile == null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "LESSON_PLAN_FILE_NOT_FOUND"
                };
            }

            // Remove the lesson plan file record
            _unitOfWork.LessonPlanFileRepository.Remove(lessonPlanFile);
            await _unitOfWork.SaveChangesAsync();

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS"
            };
        }
    }
}