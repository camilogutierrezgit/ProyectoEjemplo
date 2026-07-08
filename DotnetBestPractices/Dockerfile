# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["DotnetBestPractices.Api/DotnetBestPractices.Api.csproj", "DotnetBestPractices.Api/"]
RUN dotnet restore "DotnetBestPractices.Api/DotnetBestPractices.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/DotnetBestPractices.Api"
RUN dotnet build "DotnetBestPractices.Api.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "DotnetBestPractices.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DotnetBestPractices.Api.dll"]
