using FluentValidation;

namespace LessonPlanExam.Repositories.DTOs.SlotPlanDTOs
{
    public class UpdateSlotPlanRequest
    {
        public string Title { get; set; } = null!;
        public int? DurationMinutes { get; set; }
        public string Content { get; set; } = null!;
    }

    public class UpdateSlotPlanRequestValidator : AbstractValidator<UpdateSlotPlanRequest>
    {
        public UpdateSlotPlanRequestValidator()
        {
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