using FluentValidation;

namespace LessonPlanExam.Repositories.DTOs.LessonPlanDTOs
{
    public class GenerateLessonPlanAiRequest
    {
        public string Prompt { get; set; } = null!;
        public int GradeLevel { get; set; }
        public int NumberOfSlots { get; set; } = 3; // Default to 3 slots
        public int DurationMinutesPerSlot { get; set; } = 45; // Default to 45 minutes per slot
    }

    public class GenerateLessonPlanAiRequestValidator : AbstractValidator<GenerateLessonPlanAiRequest>
    {
        public GenerateLessonPlanAiRequestValidator()
        {
            RuleFor(x => x.Prompt)
                .NotEmpty().WithMessage("PROMPT_REQUIRED")
                .MinimumLength(10).WithMessage("PROMPT_MIN_10_CHARACTERS")
                .MaximumLength(2000).WithMessage("PROMPT_MAX_2000_CHARACTERS");

            RuleFor(x => x.GradeLevel)
                .GreaterThan(0).WithMessage("GRADE_LEVEL_MUST_BE_GREATER_THAN_ZERO")
                .LessThanOrEqualTo(12).WithMessage("GRADE_LEVEL_MAX_12");

            RuleFor(x => x.NumberOfSlots)
                .GreaterThan(0).WithMessage("NUMBER_OF_SLOTS_MUST_BE_GREATER_THAN_ZERO")
                .LessThanOrEqualTo(10).WithMessage("NUMBER_OF_SLOTS_MAX_10");

            RuleFor(x => x.DurationMinutesPerSlot)
                .GreaterThan(0).WithMessage("DURATION_MINUTES_PER_SLOT_MUST_BE_GREATER_THAN_ZERO")
                .LessThanOrEqualTo(240).WithMessage("DURATION_MINUTES_PER_SLOT_MAX_240");
        }
    }
}