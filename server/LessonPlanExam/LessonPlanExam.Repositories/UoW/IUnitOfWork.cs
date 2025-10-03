

using LessonPlanExam.Repositories.Interfaces;

namespace LessonPlanExam.Repositories.UoW
{
    public interface IUnitOfWork
    {
        IAccountRepository AccountRepository { get; }

        Task<int> SaveChangesAsync();
    }
}