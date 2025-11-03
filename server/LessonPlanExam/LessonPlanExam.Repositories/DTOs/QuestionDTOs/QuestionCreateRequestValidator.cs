using FluentValidation;
using LessonPlanExam.Repositories.DTOs.QuestionDTOs;
using LessonPlanExam.Repositories.Enums;

namespace LessonPlanExam.Repositories.DTOs.QuestionDTOs
{
    public class QuestionCreateRequestValidator : AbstractValidator<QuestionCreateRequest>
    {
        public QuestionCreateRequestValidator()
        {
            RuleFor(x => x.QuestionBankId).GreaterThan(0).WithMessage("QUESTION_BANK_REQUIRED");
            RuleFor(x => x.Title).NotEmpty().WithMessage("TITLE_REQUIRED").MaximumLength(500).WithMessage("TITLE_MAX_500_CHARACTERS");
            RuleFor(x => x.Content).NotEmpty().WithMessage("CONTENT_REQUIRED");
            RuleFor(x => x.QuestionTypeEnum).IsInEnum().WithMessage("QUESTION_TYPE_INVALID");

            When(x => x.QuestionTypeEnum == EQuestionType.MultipleChoice, () => {
                RuleFor(x => x.MultipleChoiceAnswers).NotNull().WithMessage("MC_ANSWERS_REQUIRED").Must(list => list != null && list.Count > 0).WithMessage("MC_ANSWERS_REQUIRED");
                RuleForEach(x => x.MultipleChoiceAnswers).ChildRules(ans => {
                    ans.RuleFor(a => a.AnswerText).NotEmpty().WithMessage("MC_ANSWER_TEXT_REQUIRED");
                });
            });

            When(x => x.QuestionTypeEnum == EQuestionType.FillBlank, () => {
                RuleFor(x => x.FillBlankAnswers).NotNull().WithMessage("FILLBLANK_ANSWERS_REQUIRED").Must(list => list != null && list.Count > 0).WithMessage("FILLBLANK_ANSWERS_REQUIRED");
                RuleForEach(x => x.FillBlankAnswers).ChildRules(ans => {
                    ans.RuleFor(a => a.CorrectAnswer).NotEmpty().WithMessage("FILLBLANK_CORRECT_ANSWER_REQUIRED");
                });
            });

            // Optional: ensure only relevant answers provided (not both)
            RuleFor(x => x).Custom((req, ctx) => {
                if (req.QuestionTypeEnum == EQuestionType.MultipleChoice && req.FillBlankAnswers != null && req.FillBlankAnswers.Count > 0)
                {
                    ctx.AddFailure("FillBlankAnswers must be null or empty for MultipleChoice questions");
                }
                if (req.QuestionTypeEnum == EQuestionType.FillBlank && req.MultipleChoiceAnswers != null && req.MultipleChoiceAnswers.Count > 0)
                {
                    ctx.AddFailure("MultipleChoiceAnswers must be null or empty for FillBlank questions");
                }
            });
        }
    }
}
