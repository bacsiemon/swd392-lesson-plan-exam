using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Context;

namespace LessonPlanExam.Repositories.UoW
{
    public class UnitOfWork : IUnitOfWork
    {
        #region base
        private LessonPlanExamDbContext _context;

        public UnitOfWork(LessonPlanExamDbContext context)
        {
            _context = context;
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
        #endregion

        private IAccountRepository _accountRepository;
        public IAccountRepository AccountRepository => _accountRepository ??= new Repositories.AccountRepository(_context);

    }
}
