package main

import (
	"smsIntern/sms-kadai/backend/api/get_listcontents"
	"smsIntern/sms-kadai/backend/api/get_organization_google"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	api := r.Group("/api")
	{
		api.GET("/orgs/repos", get_organization_google.ListGoogleRepos)
		api.GET("/repos/:owner/:repo/contents", get_listcontents.ListContents)
		api.GET("/repos/:owner/:repo/archive.zip", get_organization_google.ArchiveZip)
	}
	r.Run(":3030")
}
