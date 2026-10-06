# Stage 1: Build Frontend (React Vite)
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend (.NET 8.0)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-builder
WORKDIR /app
COPY backend/*.csproj ./backend/
RUN dotnet restore backend/backend.csproj
COPY backend/ ./backend/
# Copy built static frontend files into ASP.NET Core's wwwroot folder
COPY --from=frontend-builder /app/dist ./backend/wwwroot
RUN dotnet publish backend/backend.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=backend-builder /app/publish .
ENV PORT=5200
EXPOSE 5200
ENTRYPOINT ["dotnet", "backend.dll"]
