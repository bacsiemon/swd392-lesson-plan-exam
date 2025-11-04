using FluentValidation;

namespace LessonPlanExam.Repositories.DTOs.SlotPlanDTOs
{
    public class CreateSlotPlanRequest
    {
        public int LessonPlanId { get; set; }
        public int SlotNumber { get; set; }
        public string Title { get; set; } = null!;
        public int? DurationMinutes { get; set; }
        public string Content { get; set; } = null!;
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

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("CONTENT_REQUIRED");

            RuleFor(x => x.DurationMinutes)
                .GreaterThan(0).WithMessage("DURATION_MUST_BE_GREATER_THAN_ZERO")
                .When(x => x.DurationMinutes.HasValue);
        }
    }
}