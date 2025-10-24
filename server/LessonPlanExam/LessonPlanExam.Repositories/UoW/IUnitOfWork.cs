using LessonPlanExam.Repositories.Interfaces;

namespace LessonPlanExam.Repositories.UoW
{
    public interface IUnitOfWork
    {
        IAccountRepository AccountRepository { get; }
        IFileUploadRepository FileUploadRepository { get; }
        ILessonPlanRepository LessonPlanRepository { get; }

        Task<int> SaveChangesAsync();
    }
}