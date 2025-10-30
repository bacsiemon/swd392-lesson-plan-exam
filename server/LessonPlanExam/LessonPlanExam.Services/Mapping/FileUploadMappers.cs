using LessonPlanExam.Repositories.DTOs.FileUploadDTOs;
using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Services.Mapping
{
    public static class FileUploadMappers
    {
        #region Entity to DTO
        public static FileUploadResponse ToResponse(this FileUpload entity)
        {
            return new FileUploadResponse
            {
                Id = entity.Id,
                FileName = entity.FileName,
                MimeType = entity.MimeType,
                UploadedAt = entity.UploadedAt,
                FileSize = entity.Data?.Length ?? 0,
                FileUrl = $"/api/fileupload/{entity.Id}"
            };
        }

        public static FileUploadResponse ToResponse(this FileUpload entity, string baseUrl)
        {
            return new FileUploadResponse
            {
                Id = entity.Id,
                FileName = entity.FileName,
                MimeType = entity.MimeType,
                UploadedAt = entity.UploadedAt,
                FileSize = entity.Data?.Length ?? 0,
                FileUrl = $"{baseUrl?.TrimEnd('/')}/api/fileupload/{entity.Id}"
            };
        }

        public static FileDownloadResponse ToDownloadResponse(this FileUpload entity)
        {
            return new FileDownloadResponse
            {
                FileName = entity.FileName,
                MimeType = entity.MimeType,
                Data = entity.Data
            };
        }

        public static FileDirectResponse ToDirectResponse(this FileUpload entity)
        {
            return new FileDirectResponse
            {
                FileName = entity.FileName,
                MimeType = entity.MimeType,
                Data = entity.Data,
                LastModified = entity.UploadedAt
            };
        }
        #endregion
    }
}