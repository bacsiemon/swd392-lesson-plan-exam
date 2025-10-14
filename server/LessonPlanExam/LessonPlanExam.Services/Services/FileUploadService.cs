using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.FileUploadDTOs;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Configuration;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace LessonPlanExam.Services.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly FileUploadConfiguration _fileUploadConfig;

        public FileUploadService(IUnitOfWork unitOfWork, IOptions<FileUploadConfiguration> fileUploadConfig)
        {
            _unitOfWork = unitOfWork;
            _fileUploadConfig = fileUploadConfig.Value;
        }

        public async Task<BaseResponse<FileUploadResponse>> UploadFileAsync(IFormFile request)
        {
            using var memoryStream = new MemoryStream();
            await request.CopyToAsync(memoryStream);
            var fileData = memoryStream.ToArray();

            var entity = new LessonPlanExam.Repositories.Models.FileUpload
            {
                Data = fileData,
                FileName = request.FileName,
                MimeType = request.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            _unitOfWork.FileUploadRepository.Create(entity);
            await _unitOfWork.SaveChangesAsync();

            var response = new BaseResponse<FileUploadResponse>
            {
                StatusCode = 201,
                Message = "SUCCESS",
                Data = entity.ToResponse(_fileUploadConfig.BaseUrl)
            };

            return response;
        }

        public async Task<BaseResponse<FileUploadResponse>> GetFileInfoByIdAsync(int id)
        {
            var entity = await _unitOfWork.FileUploadRepository.GetByIdAsync(id);
            if (entity == null)
            {
                return new BaseResponse<FileUploadResponse>
                {
                    StatusCode = 404,
                    Message = "FILE_NOT_FOUND"
                };
            }

            var response = new BaseResponse<FileUploadResponse>
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = entity.ToResponse(_fileUploadConfig.BaseUrl)
            };

            return response;
        }

        public async Task<BaseResponse<FileDownloadResponse>> DownloadFileAsync(int id)
        {
            var entity = await _unitOfWork.FileUploadRepository.GetByIdAsync(id);
            if (entity == null)
            {
                return new BaseResponse<FileDownloadResponse>
                {
                    StatusCode = 404,
                    Message = "FILE_NOT_FOUND"
                };
            }

            var response = new BaseResponse<FileDownloadResponse>
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = entity.ToDownloadResponse()
            };

            return response;
        }

        public async Task<BaseResponse> DeleteFileAsync(int id)
        {
            var entity = await _unitOfWork.FileUploadRepository.GetByIdAsync(id);
            if (entity == null)
            {
                return new BaseResponse
                {
                    StatusCode = 404,
                    Message = "FILE_NOT_FOUND"
                };
            }

            _unitOfWork.FileUploadRepository.Remove(entity);
            await _unitOfWork.SaveChangesAsync();

            var response = new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS"
            };

            return response;
        }

        public async Task<BaseResponse<FileDirectResponse>> GetFileDirectAsync(int id)
        {
            var entity = await _unitOfWork.FileUploadRepository.GetByIdAsync(id);
            if (entity == null)
            {
                return new BaseResponse<FileDirectResponse>
                {
                    StatusCode = 404,
                    Message = "FILE_NOT_FOUND"
                };
            }

            var response = new BaseResponse<FileDirectResponse>
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = entity.ToDirectResponse()
            };

            return response;
        }
    }
}