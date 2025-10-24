using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.LessonPlanDTOs;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using System.Linq.Expressions;

namespace LessonPlanExam.Services.Services
{
    public class LessonPlanService : ILessonPlanService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAccountService _accountService;

        public LessonPlanService(IUnitOfWork unitOfWork, IAccountService accountService)
        {
            _unitOfWork = unitOfWork;
            _accountService = accountService;
        }

        public async Task<BaseResponse> CreateLessonPlanAsync(CreateLessonPlanRequest request)
        {
            // Get current user ID from JWT token via AccountService
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
                Message = "LESSON_PLAN_CREATED_SUCCESSFULLY",
                Data = lessonPlan.ToResponse()
            };
        }

        public async Task<BaseResponse> GetLessonPlanByIdAsync(int id)
        {
            // Using strongly typed include for GetByIdAsync
            var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(
                id
            );

            if (lessonPlan == null || lessonPlan.DeletedAt != null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Message = "LESSON_PLAN_NOT_FOUND"
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


        public async Task<BaseResponse> UpdateLessonPlanAsync(int id, UpdateLessonPlanRequest request)
        {
            var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(id);
            
            if (lessonPlan == null || lessonPlan.DeletedAt != null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Message = "LESSON_PLAN_NOT_FOUND"
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
                Message = "LESSON_PLAN_UPDATED_SUCCESSFULLY",
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
                    Message = "LESSON_PLAN_NOT_FOUND"
                };
            }

            // Soft delete by setting DeletedAt timestamp
            lessonPlan.DeletedAt = DateTime.UtcNow;
            _unitOfWork.LessonPlanRepository.Update(lessonPlan);
            await _unitOfWork.SaveChangesAsync();

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "LESSON_PLAN_DELETED_SUCCESSFULLY"
            };
        }
    }
}