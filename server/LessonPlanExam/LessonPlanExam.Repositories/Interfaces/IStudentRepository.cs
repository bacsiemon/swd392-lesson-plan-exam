using LessonPlanExam.Repositories.Interfaces.Base;
using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface IStudentRepository : IGenericRepository<Student>
    {
        Task<Student?> GetByAccountIdAsync(int accountId);
        Task<IEnumerable<Student>> GetActiveStudentsAsync();
    }
}