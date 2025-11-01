using LessonPlanExam.Repositories.Enums;

namespace LessonPlanExam.Repositories.DTOs.QuestionBankDTOs
{
	public class QuestionBankResponse
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public int GradeLevel { get; set; }
		public int TeacherId { get; set; }
		public string Description { get; set; }
		public EQuestionBankStatus? StatusEnum { get; set; }
		public DateTime? CreatedAt { get; set; }
		public DateTime? UpdatedAt { get; set; }
	}

	public class QuestionBankListItem
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public int GradeLevel { get; set; }
		public int TeacherId { get; set; }
		public EQuestionBankStatus? StatusEnum { get; set; }
		public int TotalQuestions { get; set; }
		public DateTime? CreatedAt { get; set; }
	}

	public class QuestionBankStatsResponse
	{
		public int TotalQuestions { get; set; }
		public Dictionary<string, int> ByType { get; set; }
		public Dictionary<string, int> ByDifficulty { get; set; }
		public Dictionary<string, int> ByDomain { get; set; }
	}
}

