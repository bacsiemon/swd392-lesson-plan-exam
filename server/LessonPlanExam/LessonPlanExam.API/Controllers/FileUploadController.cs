using LessonPlanExam.Repositories.DTOs.FileUploadDTOs;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileUploadController : ControllerBase
    {
        private readonly IFileUploadService _fileUploadService;

        public FileUploadController(IFileUploadService fileUploadService)
        {
            _fileUploadService = fileUploadService;
        }


        /// <summary>User</summary>
        /// <remarks>
        /// 
        /// Upload a file to the server with automatic validation.
        /// 
        /// Maximum file size: 10MB  
        /// 
        /// Validation is performed automatically using FluentValidation before processing.
        /// 
        /// Sample request:
        /// 
        /// POST /api/fileupload  
        /// Content-Type: multipart/form-data  
        /// 
        /// Form Data:  
        /// - file: [Select file to upload]  
        /// 
        /// </remarks>
        /// <param name="request">File upload request containing the file</param>
        /// <response code="201">File uploaded successfully. Returns file information including ID, filename, MIME type, upload date, and file size.</response>
        /// <response code="400">Validation error with structured error response. Possible validation messages:  
        /// - FILE_REQUIRED  
        /// - INVALID_FILE_EXTENSION  
        /// - FILE_SIZE_EXCEEDS_LIMIT  
        /// </response>
        /// <response code="500">Internal server error occurred during file upload. Handled by ExceptionMiddleware.</response>
        [HttpPost]
        public async Task<IActionResult> UploadFileAsync([FromForm] FileUploadRequest request)
        {
            // Validation is handled automatically by ValidationActionFilter
            var response = await _fileUploadService.UploadFileAsync(request.File);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// 
        /// Get file information by ID.
        /// 
        /// Sample request:
        /// 
        /// GET /api/fileupload/123
        /// 
        /// </remarks>
        /// <param name="id">The ID of the file to retrieve information for</param>
        /// <response code="200">File information retrieved successfully. Returns file metadata including filename, MIME type, upload date, and file size.</response>
        /// <response code="404">File not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred while retrieving file information. Handled by ExceptionMiddleware.</response>
        [HttpGet("{id}/info")]
        public async Task<IActionResult> GetFileInfoByIdAsync(int id)
        {
            var response = await _fileUploadService.GetFileInfoByIdAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// 
        /// Download a file by ID.
        /// 
        /// Sample request:
        /// 
        /// GET /api/fileupload/123/download
        /// 
        /// </remarks>
        /// <param name="id">The ID of the file to download</param>
        /// <response code="200">File downloaded successfully. Returns the file as a binary stream with appropriate content type and filename.</response>
        /// <response code="404">File not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred during file download. Handled by ExceptionMiddleware.</response>
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadFileAsync(int id)
        {
            var response = await _fileUploadService.DownloadFileAsync(id);

            if (response.Errors != null)
            {
                return StatusCode(response.StatusCode, response);
            }

            return File(response.Data.Data, response.Data.MimeType, response.Data.FileName);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// 
        /// Delete a file by ID.
        /// 
        /// Sample request:
        /// 
        /// DELETE /api/fileupload/123
        /// 
        /// </remarks>
        /// <param name="id">The ID of the file to delete</param>
        /// <response code="200">File deleted successfully.</response>
        /// <response code="404">File not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred during file deletion. Handled by ExceptionMiddleware.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFileAsync(int id)
        {
            var response = await _fileUploadService.DeleteFileAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary></summary>
        /// <remarks>
        /// 
        /// Get file directly like a CDN - returns raw file content with appropriate headers.
        /// This endpoint can be used for direct linking in web pages, displaying images, embedding documents, etc.
        /// 
        /// Features:
        /// - Returns raw file content with proper MIME type
        /// - Supports range requests for large files
        /// - Can be used directly in HTML img tags, anchor tags, etc.
        /// 
        /// Sample requests:
        /// 
        /// GET /api/fileupload/123/direct
        /// 
        /// Usage examples:
        /// - In HTML: &lt;img src="/api/fileupload/123/direct" alt="Image" /&gt;
        /// - In HTML: &lt;a href="/api/fileupload/123/direct"&gt;Download Document&lt;/a&gt;
        /// - Direct browser access: https://yourapp.com/api/fileupload/123/direct
        /// 
        /// </remarks>
        /// <param name="id">The ID of the file to retrieve directly</param>
        /// <response code="200">File content returned as raw binary with appropriate headers (Content-Type, Cache-Control, Last-Modified, etc.)</response>
        /// <response code="404">File not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred during file retrieval. Handled by ExceptionMiddleware.</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFileDirectAsync(int id)
        {
            var response = await _fileUploadService.GetFileDirectAsync(id);
            
            if (response.Errors != null)
            {
                return StatusCode(response.StatusCode, response);
            }

            // Return raw file content with proper content type
            return File(response.Data.Data, response.Data.MimeType, enableRangeProcessing: true);
        }
    }
}