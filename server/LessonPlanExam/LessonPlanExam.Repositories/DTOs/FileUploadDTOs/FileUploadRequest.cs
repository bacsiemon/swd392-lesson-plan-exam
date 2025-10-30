using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace LessonPlanExam.Repositories.DTOs.FileUploadDTOs
{
    public class FileUploadRequest
    {
        public IFormFile File { get; set; } = null!;
    }

    public class FileUploadRequestValidator : AbstractValidator<FileUploadRequest>
    {
        private const int MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

        public FileUploadRequestValidator()
        {
            RuleFor(x => x.File)
                .NotNull().WithMessage("FILE_REQUIRED")
                .Must(HaveValidSize).WithMessage("FILE_SIZE_EXCEEDS_LIMIT");
        }

        private bool HaveValidSize(IFormFile? file)
        {
            if (file is null) return false;
            return file.Length <= MAX_FILE_SIZE;
        }
    }
}