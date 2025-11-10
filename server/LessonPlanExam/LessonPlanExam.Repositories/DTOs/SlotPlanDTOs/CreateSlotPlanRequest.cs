using FluentValidation;

namespace LessonPlanExam.Repositories.DTOs.SlotPlanDTOs
{
    public class CreateSlotPlanRequest
    {
        public int LessonPlanId { get; set; }
        public int SlotNumber { get; set; }
        public string Title { get; set; } = null!;
        public int? DurationMinutes { get; set; }
        public string? Objectives { get; set; }
        public string? EquipmentNeeded { get; set; }
        public string? Preparations { get; set; }
        public string? Activities { get; set; }
        public string? ReviseQuestions { get; set; }
    }

    public class CreateSlotPlanRequestValidator : AbstractValidator<CreateSlotPlanRequest>
    {
        public CreateSlotPlanRequestValidator()
        {
            RuleFor(x => x.LessonPlanId)
                .GreaterThan(0).WithMessage("LESSON_PLAN_ID_REQUIRED");

            RuleFor(x => x.SlotNumber)
                .GreaterThan(0).WithMessage("SLOT_NUMBER_REQUIRED");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("TITLE_REQUIRED")
                .MaximumLength(255).WithMessage("TITLE_MAX_255_CHARACTERS");

            RuleFor(x => x.DurationMinutes)
                .GreaterThan(0).WithMessage("DURATION_MUST_BE_GREATER_THAN_ZERO")
                .When(x => x.DurationMinutes.HasValue);

            RuleFor(x => x.Objectives)
                .MaximumLength(2000).WithMessage("OBJECTIVES_MAX_2000_CHARACTERS")
                .When(x => !string.IsNullOrEmpty(x.Objectives));

            RuleFor(x => x.EquipmentNeeded)
                .MaximumLength(1000).WithMessage("EQUIPMENT_NEEDED_MAX_1000_CHARACTERS")
                .When(x => !string.IsNullOrEmpty(x.EquipmentNeeded));

            RuleFor(x => x.Preparations)
                .MaximumLength(2000).WithMessage("PREPARATIONS_MAX_2000_CHARACTERS")
                .When(x => !string.IsNullOrEmpty(x.Preparations));

            RuleFor(x => x.Activities)
                .MaximumLength(2000).WithMessage("ACTIVITIES_MAX_2000_CHARACTERS")
                .When(x => !string.IsNullOrEmpty(x.Activities));

            RuleFor(x => x.ReviseQuestions)
                .MaximumLength(2000).WithMessage("REVISE_QUESTIONS_MAX_2000_CHARACTERS")
                .When(x => !string.IsNullOrEmpty(x.ReviseQuestions));
        }
    }
}