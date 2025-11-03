using FluentValidation;

namespace LessonPlanExam.Repositories.DTOs.LessonPlanDTOs
{
    public class CreateLessonPlanRequest
    {
        public string Title { get; set; } = null!;
        public string Objectives { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public int GradeLevel { get; set; }
    }

    public class CreateLessonPlanRequestValidator : AbstractValidator<CreateLessonPlanRequest>
    {
        public CreateLessonPlanRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("TITLE_REQUIRED")
                .MaximumLength(200).WithMessage("TITLE_MAX_200_CHARACTERS");

            RuleFor(x => x.Objectives)
                .NotEmpty().WithMessage("OBJECTIVES_REQUIRED")
                .MaximumLength(1000).WithMessage("OBJECTIVES_MAX_1000_CHARACTERS");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("DESCRIPTION_REQUIRED")
                .MaximumLength(2000).WithMessage("DESCRIPTION_MAX_2000_CHARACTERS");

            RuleFor(x => x.GradeLevel)
                .GreaterThan(0).WithMessage("GRADE_LEVEL_REQUIRED");

            RuleFor(x => x.ImageUrl)
                .MaximumLength(500).WithMessage("IMAGE_URL_MAX_500_CHARACTERS")
                .When(x => !string.IsNullOrEmpty(x.ImageUrl));
        }
    }
}