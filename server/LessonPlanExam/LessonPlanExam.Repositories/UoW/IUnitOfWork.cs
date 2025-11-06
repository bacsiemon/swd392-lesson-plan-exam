using LessonPlanExam.Repositories.Interfaces;

namespace LessonPlanExam.Repositories.UoW
{
    public interface IUnitOfWork
    {
        IAccountRepository AccountRepository { get; }
        IStudentRepository StudentRepository { get; }
        ITeacherRepository TeacherRepository { get; }
        IFileUploadRepository FileUploadRepository { get; }
        ILessonPlanRepository LessonPlanRepository { get; }
        ILessonPlanFileRepository LessonPlanFileRepository { get; }
        ISlotPlanRepository SlotPlanRepository { get; }

        Task<int> SaveChangesAsync();
    }
}