using System.Security.Cryptography;
using System.Text;

namespace App.Infrastructure.Helpers;

public static class PasswordHelper
{
    private const int SaltSize = 16; // 128 bits
    private const int KeySize = 32; // 256 bits
    private const int Iterations = 10000;

    /// <summary>
    /// Hashes a password using PBKDF2 with a random salt
    /// </summary>
    /// <param name="password">The password to hash</param>
    /// <returns>The hashed password with salt included</returns>
    public static string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentException("Password cannot be null or empty", nameof(password));

        // Generate a random salt
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[SaltSize];
        rng.GetBytes(salt);

        // Hash the password with the salt
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var hash = pbkdf2.GetBytes(KeySize);

        // Combine salt and hash
        var hashBytes = new byte[SaltSize + KeySize];
        Array.Copy(salt, 0, hashBytes, 0, SaltSize);
        Array.Copy(hash, 0, hashBytes, SaltSize, KeySize);

        // Convert to base64 string
        return Convert.ToBase64String(hashBytes);
    }

    /// <summary>
    /// Verifies a password against a hash
    /// </summary>
    /// <param name="password">The password to verify</param>
    /// <param name="hash">The stored hash to verify against</param>
    /// <returns>True if the password matches the hash</returns>
    public static bool VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrEmpty(password))
            return false;

        if (string.IsNullOrEmpty(hash))
            return false;

        try
        {
            // Convert base64 string back to bytes
            var hashBytes = Convert.FromBase64String(hash);

            // Extract the salt
            var salt = new byte[SaltSize];
            Array.Copy(hashBytes, 0, salt, 0, SaltSize);

            // Hash the input password with the extracted salt
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            var testHash = pbkdf2.GetBytes(KeySize);

            // Compare the hashes
            for (int i = 0; i < KeySize; i++)
            {
                if (hashBytes[i + SaltSize] != testHash[i])
                    return false;
            }

            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Generates a random token for password reset or email verification
    /// </summary>
    /// <param name="length">The length of the token (default: 32)</param>
    /// <returns>A random token string</returns>
    public static string GenerateRandomToken(int length = 32)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[length];
        rng.GetBytes(bytes);

        var result = new StringBuilder(length);
        foreach (byte b in bytes)
        {
            result.Append(chars[b % chars.Length]);
        }

        return result.ToString();
    }

    /// <summary>
    /// Generates a 6-digit OTP
    /// </summary>
    /// <returns>A 6-digit OTP string</returns>
    public static string GenerateOTP()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var randomInt = Math.Abs(BitConverter.ToInt32(bytes, 0));
        return (randomInt % 1000000).ToString("D6");
    }

    /// <summary>
    /// Validates password strength
    /// </summary>
    /// <param name="password">The password to validate</param>
    /// <returns>True if password meets strength requirements</returns>
    public static bool IsStrongPassword(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 6)
            return false;

        var hasUpper = false;
        var hasLower = false;
        var hasDigit = false;
        var hasSpecial = false;

        foreach (char c in password)
        {
            if (char.IsUpper(c)) hasUpper = true;
            else if (char.IsLower(c)) hasLower = true;
            else if (char.IsDigit(c)) hasDigit = true;
            else if (!char.IsLetterOrDigit(c)) hasSpecial = true;
        }

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}