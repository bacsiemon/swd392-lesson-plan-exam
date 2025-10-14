using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.FileUploadDTOs;
using Microsoft.AspNetCore.Http;

namespace LessonPlanExam.Services.Interfaces
{
    public interface IFileUploadService
    {
        Task<BaseResponse<FileUploadResponse>> UploadFileAsync(IFormFile file);
        Task<BaseResponse<FileUploadResponse>> GetFileInfoByIdAsync(int id);
        Task<BaseResponse<FileDownloadResponse>> DownloadFileAsync(int id);
        Task<BaseResponse> DeleteFileAsync(int id);
        Task<BaseResponse<FileDirectResponse>> GetFileDirectAsync(int id);
        
    }
}