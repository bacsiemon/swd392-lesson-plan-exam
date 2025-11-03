using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace LessonPlanExam.Repositories.Repositories
{
    public class TeacherRepository : GenericRepository<Teacher>, ITeacherRepository
    {
        public TeacherRepository(LessonPlanExamDbContext context) : base(context)
        {
        }

        public async Task<Teacher?> GetByAccountIdAsync(int accountId)
        {
            return await _context.Teachers
                .Include(t => t.Account)
                .FirstOrDefaultAsync(t => t.AccountId == accountId);
        }

        public async Task<IEnumerable<Teacher>> GetActiveTeachersAsync()
        {
            return await _context.Teachers
                .Include(t => t.Account)
                .Where(t => t.IsActive == true && t.Account.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Teacher>> GetTeachersBySchoolAsync(string schoolName)
        {
            return await _context.Teachers
                .Include(t => t.Account)
                .Where(t => t.SchoolName == schoolName && t.IsActive == true && t.Account.DeletedAt == null)
                .ToListAsync();
        }
    }
}