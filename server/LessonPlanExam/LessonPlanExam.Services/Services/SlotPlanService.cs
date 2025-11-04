using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.SlotPlanDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using Microsoft.EntityFrameworkCore;

namespace LessonPlanExam.Services.Services
{
    public class SlotPlanService : ISlotPlanService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAccountService _accountService;

        public SlotPlanService(IUnitOfWork unitOfWork, IAccountService accountService)
        {
            _unitOfWork = unitOfWork;
            _accountService = accountService;
        }

        public async Task<BaseResponse> CreateSlotPlanAsync(CreateSlotPlanRequest request)
        {
            // Check if user is a teacher
            var currentRole = _accountService.GetCurrentUserRole();
            if (currentRole != EUserRole.Teacher)
            {
                return new BaseResponse
                {
                    StatusCode = 403,
                    Errors = "TEACHER_ONLY"
                };
            }

            var currentUserId = _accountService.GetCurrentUserId();

            // Check if the lesson plan exists and belongs to the current teacher
            var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(request.LessonPlanId);
            if (lessonPlan == null || lessonPlan.DeletedAt != null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "LESSON_PLAN_NOT_FOUND"
                };
            }

            if (lessonPlan.CreatedByTeacher != currentUserId)
            {
                return new BaseResponse
                {
                    StatusCode = 403,
                    Errors = "LESSON_PLAN_NOT_OWNED_BY_TEACHER"
                };
            }

            // Check if slot number already exists for this lesson plan
            var existingSlotPlans = await _unitOfWork.SlotPlanRepository
                .GetPaginatedAsync(
                    page: 1, 
                    size: 1, 
                    firstPage: 1, 
                    predicate: sp => sp.LessonPlanId == request.LessonPlanId && sp.SlotNumber == request.SlotNumber, 
                    orderBy: null, 
                    includeProperties: new string[0]
                );
            
            if (existingSlotPlans.Items.Any())
            {
                return new BaseResponse
                {
                    StatusCode = 400,
                    Errors = "SLOT_NUMBER_ALREADY_EXISTS"
                };
            }

            var slotPlan = request.ToEntity();
            _unitOfWork.SlotPlanRepository.Create(slotPlan);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties for response
            var createdSlotPlan = await _unitOfWork.SlotPlanRepository.GetByIdAsync(
                slotPlan.Id,
                sp => sp.LessonPlan
            );

            return new BaseResponse
            {
                StatusCode = 201,
                Message = "SUCCESS",
                Data = createdSlotPlan.ToResponse()
            };
        }

        public async Task<BaseResponse> UpdateSlotPlanAsync(int id, UpdateSlotPlanRequest request)
        {
            // Check if user is a teacher
            var currentRole = _accountService.GetCurrentUserRole();
            if (currentRole != EUserRole.Teacher)
            {
                return new BaseResponse
                {
                    StatusCode = 403,
                    Errors = "TEACHER_ONLY"
                };
            }

            var currentUserId = _accountService.GetCurrentUserId();

            // Get the slot plan with lesson plan details
            var slotPlan = await _unitOfWork.SlotPlanRepository.GetByIdAsync(
                id,
                sp => sp.LessonPlan
            );

            if (slotPlan == null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "SLOT_PLAN_NOT_FOUND"
                };
            }

            // Check if the lesson plan exists and is not deleted
            if (slotPlan.LessonPlan == null || slotPlan.LessonPlan.DeletedAt != null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "LESSON_PLAN_NOT_FOUND"
                };
            }

            // Check if the lesson plan belongs to the current teacher
            if (slotPlan.LessonPlan.CreatedByTeacher != currentUserId)
            {
                return new BaseResponse
                {
                    StatusCode = 403,
                    Errors = "LESSON_PLAN_NOT_OWNED_BY_TEACHER"
                };
            }

            // Update the slot plan
            slotPlan.UpdateFromRequest(request);
            _unitOfWork.SlotPlanRepository.Update(slotPlan);
            await _unitOfWork.SaveChangesAsync();

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = slotPlan.ToResponse()
            };
        }

        public async Task<BaseResponse> DeleteSlotPlanAsync(int id)
        {
            // Check if user is a teacher
            var currentRole = _accountService.GetCurrentUserRole();
            if (currentRole != EUserRole.Teacher)
            {
                return new BaseResponse
                {
                    StatusCode = 403,
                    Errors = "TEACHER_ONLY"
                };
            }

            var currentUserId = _accountService.GetCurrentUserId();

            // Get the slot plan with lesson plan details
            var slotPlan = await _unitOfWork.SlotPlanRepository.GetByIdAsync(
                id,
                sp => sp.LessonPlan
            );

            if (slotPlan == null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "SLOT_PLAN_NOT_FOUND"
                };
            }

            // Check if the lesson plan exists and is not deleted
            if (slotPlan.LessonPlan == null || slotPlan.LessonPlan.DeletedAt != null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Errors = "LESSON_PLAN_NOT_FOUND"
                };
            }

            // Check if the lesson plan belongs to the current teacher
            if (slotPlan.LessonPlan.CreatedByTeacher != currentUserId)
            {
                return new BaseResponse
                {
                    StatusCode = 403,
                    Errors = "LESSON_PLAN_NOT_OWNED_BY_TEACHER"
                };
            }

            // Delete the slot plan
            _unitOfWork.SlotPlanRepository.Remove(slotPlan);
            await _unitOfWork.SaveChangesAsync();

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS"
            };
        }
    }
}