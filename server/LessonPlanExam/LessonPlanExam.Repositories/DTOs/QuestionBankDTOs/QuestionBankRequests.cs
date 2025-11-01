using System.ComponentModel.DataAnnotations;
using LessonPlanExam.Repositories.Enums;

namespace LessonPlanExam.Repositories.DTOs.QuestionBankDTOs
{
	public class CreateQuestionBankRequest
	{
		[Required]
		[StringLength(255)]
		public string Name { get; set; }

		[Required]
		public int GradeLevel { get; set; }

		[Required]
		public int TeacherId { get; set; }

		[StringLength(2000)]
		public string Description { get; set; }
	}

	public class UpdateQuestionBankRequest
	{
		[Required]
		[StringLength(255)]
		public string Name { get; set; }

		[Required]
		public int GradeLevel { get; set; }

		[StringLength(2000)]
		public string Description { get; set; }
	}

	public class UpdateQuestionBankStatusRequest
	{
		[Required]
		public EQuestionBankStatus StatusEnum { get; set; }
	}

	public class ImportQuestionBankItemsRequest
	{
		[Required]
		public int QuestionBankId { get; set; }

		[Required]
		public List<ImportQuestionItem> Items { get; set; }
	}

	public class ImportQuestionItem
	{
		[Required]
		[StringLength(500)]
		public string Title { get; set; }

		[Required]
		public string Content { get; set; }

		[Required]
		public EQuestionType QuestionTypeEnum { get; set; }

		public int? QuestionDifficultyId { get; set; }

		public string Domain { get; set; }

		public List<ImportMultipleChoiceAnswer> MultipleChoiceAnswers { get; set; }

		public List<ImportFillBlankAnswer> FillBlankAnswers { get; set; }

		public string AdditionalData { get; set; }
	}

	public class ImportMultipleChoiceAnswer
	{
		[Required]
		public string AnswerText { get; set; }
		public bool IsCorrect { get; set; }
		public string Explanation { get; set; }
		public int? OrderIndex { get; set; }
	}

	public class ImportFillBlankAnswer
	{
		[Required]
		public string CorrectAnswer { get; set; }
		public string NormalizedCorrectAnswer { get; set; }
		public string Explanation { get; set; }
	}
}

