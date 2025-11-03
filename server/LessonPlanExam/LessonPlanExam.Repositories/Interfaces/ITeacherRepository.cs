using LessonPlanExam.Repositories.Interfaces.Base;
using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface ITeacherRepository : IGenericRepository<Teacher>
    {
        Task<Teacher?> GetByAccountIdAsync(int accountId);
        Task<IEnumerable<Teacher>> GetActiveTeachersAsync();
        Task<IEnumerable<Teacher>> GetTeachersBySchoolAsync(string schoolName);
    }
}