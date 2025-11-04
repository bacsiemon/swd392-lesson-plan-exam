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

        private IStudentRepository _studentRepository;
        public IStudentRepository StudentRepository => _studentRepository ??= new Repositories.StudentRepository(_context);

        private ITeacherRepository _teacherRepository;
        public ITeacherRepository TeacherRepository => _teacherRepository ??= new Repositories.TeacherRepository(_context);

        private IFileUploadRepository _fileUploadRepository;
        public IFileUploadRepository FileUploadRepository => _fileUploadRepository ??= new Repositories.FileUploadRepository(_context);

        private ILessonPlanRepository _lessonPlanRepository;
        public ILessonPlanRepository LessonPlanRepository => _lessonPlanRepository ??= new Repositories.LessonPlanRepository(_context);

        private ILessonPlanFileRepository _lessonPlanFileRepository;
        public ILessonPlanFileRepository LessonPlanFileRepository => _lessonPlanFileRepository ??= new Repositories.LessonPlanFileRepository(_context);

        private ISlotPlanRepository _slotPlanRepository;
        public ISlotPlanRepository SlotPlanRepository => _slotPlanRepository ??= new Repositories.SlotPlanRepository(_context);
    }
}
