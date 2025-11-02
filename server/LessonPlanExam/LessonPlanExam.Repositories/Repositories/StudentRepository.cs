using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace LessonPlanExam.Repositories.Repositories
{
    public class StudentRepository : GenericRepository<Student>, IStudentRepository
    {
        public StudentRepository(LessonPlanExamDbContext context) : base(context)
        {
        }

        public async Task<Student?> GetByAccountIdAsync(int accountId)
        {
            return await _context.Students
                .Include(s => s.Account)
                .FirstOrDefaultAsync(s => s.AccountId == accountId);
        }

        public async Task<IEnumerable<Student>> GetActiveStudentsAsync()
        {
            return await _context.Students
                .Include(s => s.Account)
                .Where(s => s.IsActive == true && s.Account.DeletedAt == null)
                .ToListAsync();
        }
    }
}