@echo off
echo Testing Delete Account API...

echo.
echo 1. Register Admin account:
curl -X POST "http://localhost:5166/api/Account/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\": \"Admin Test\", \"email\": \"admin@test.com\", \"password\": \"Admin123!\", \"phone\": \"0901234567\", \"role\": 0}"

echo.
echo.
echo 2. Register Teacher account:
curl -X POST "http://localhost:5166/api/Account/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\": \"Teacher Test\", \"email\": \"teacher@test.com\", \"password\": \"Teacher123!\", \"phone\": \"0901234568\", \"role\": 1}"

echo.
echo.
echo 3. Login Admin to get token:
curl -X POST "http://localhost:5166/api/Account/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"admin@test.com\", \"password\": \"Admin123!\"}"

echo.
echo.
echo Test completed! Check the responses above.
echo Please manually get the teacher ID and admin token to test delete API.

pause