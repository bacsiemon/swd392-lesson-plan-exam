using LessonPlanExam.Repositories.DTOs.ExamDTOs;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Enums;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface IExamRepository
    {
        Task<Exam> CreateExamAsync(ExamCreateRequest request, CancellationToken ct = default);
        Task<Exam> CreateExamFromMatrixAsync(ExamFromMatrixRequest request, CancellationToken ct = default);
        Task<IEnumerable<Exam>> GetExamsByTeacherAsync(int? teacherId, EExamStatus? status, string q, CancellationToken ct = default);
        Task<Exam> GetExamWithQuestionsAsync(int id, CancellationToken ct = default);
        Task<Exam> UpdateExamAsync(int id, ExamUpdateRequest request, CancellationToken ct = default);
        Task<bool> UpdateExamStatusAsync(int id, EExamStatus status, CancellationToken ct = default);
        Task<ExamQuestion> AddExamQuestionAsync(int examId, ExamQuestionAddRequest request, CancellationToken ct = default);
        Task<ExamQuestion> UpdateExamQuestionAsync(int examQuestionId, ExamQuestionAddRequest request, CancellationToken ct = default);
        Task<bool> DeleteExamQuestionAsync(int examQuestionId, CancellationToken ct = default);
        Task<IEnumerable<PreviewQuestionItem>> PreviewRandomAsync(int matrixId, decimal? totalPoints, CancellationToken ct = default);
        Task<int> GetStudentAttemptCountAsync(int examId, int studentId, CancellationToken ct = default);
    }
}
