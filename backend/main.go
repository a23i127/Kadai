package main

import (
	"smsIntern/sms-kadai/backend/api/get_file_or_dir_detail"
	"smsIntern/sms-kadai/backend/api/get_organization_google"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))
	api := r.Group("/api")
	{
		api.GET("/orgs/repos", get_organization_google.ListGoogleRepos)
		api.GET("/repos/:owner/:repo/contents/*path", get_file_or_dir_detail.GetFileOrDirContents)
		api.GET("/repos/:owner/:repo/archive.zip", get_organization_google.ArchiveZip)
	}
	r.Run(":3030")
}
