using System.Security.Cryptography;
using System.Text;

namespace LessonPlanExam.Services.Helpers;

/// <summary>
/// Helper class for password operations
/// </summary>
public static class PasswordHelper
{
    /// <summary>
    /// Hash password using PBKDF2
    /// </summary>
    /// <param name="password">Plain text password</param>
    /// <returns>Hashed password</returns>
    public static string HashPassword(string password)
    {
        // Generate a random salt
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        
        // Hash the password with the salt using PBKDF2
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            100000, // iterations
            HashAlgorithmName.SHA256,
            32); // hash length

        // Combine salt and hash
        byte[] combined = new byte[salt.Length + hash.Length];
        Buffer.BlockCopy(salt, 0, combined, 0, salt.Length);
        Buffer.BlockCopy(hash, 0, combined, salt.Length, hash.Length);

        return Convert.ToBase64String(combined);
    }

    /// <summary>
    /// Verify password against hash
    /// </summary>
    /// <param name="password">Plain text password</param>
    /// <param name="hashedPassword">Hashed password</param>
    /// <returns>True if password matches</returns>
    public static bool VerifyPassword(string password, string hashedPassword)
    {
        try
        {
            byte[] combined = Convert.FromBase64String(hashedPassword);
            
            if (combined.Length < 16)
                return false;

            // Extract salt and hash
            byte[] salt = new byte[16];
            byte[] hash = new byte[combined.Length - 16];
            Buffer.BlockCopy(combined, 0, salt, 0, 16);
            Buffer.BlockCopy(combined, 16, hash, 0, hash.Length);

            // Hash the input password with the same salt
            byte[] inputHash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                salt,
                100000, // same iterations
                HashAlgorithmName.SHA256,
                hash.Length);

            // Compare hashes
            return hash.SequenceEqual(inputHash);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Generate random token
    /// </summary>
    /// <param name="length">Token length</param>
    /// <returns>Random token string</returns>
    public static string GenerateRandomToken(int length = 32)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new Random();
        var result = new StringBuilder(length);
        
        for (int i = 0; i < length; i++)
        {
            result.Append(chars[random.Next(chars.Length)]);
        }
        
        return result.ToString();
    }

    /// <summary>
    /// Generate numeric OTP
    /// </summary>
    /// <param name="length">OTP length (default 6)</param>
    /// <returns>Numeric OTP string</returns>
    public static string GenerateOTP(int length = 6)
    {
        var random = new Random();
        var result = new StringBuilder(length);
        
        for (int i = 0; i < length; i++)
        {
            result.Append(random.Next(0, 10));
        }
        
        return result.ToString();
    }
}