package main

import (
	db_delete "smsIntern/sms-kadai/backend/api/db_delete"
	file_dir_post "smsIntern/sms-kadai/backend/api/db_post/file_or_dhirectory"
	db_post "smsIntern/sms-kadai/backend/api/db_post/repository"
	"smsIntern/sms-kadai/backend/api/get_db_cash"
	getdbrepository "smsIntern/sms-kadai/backend/api/get_db_repository"
	"smsIntern/sms-kadai/backend/api/get_file_or_dir_detail"
	"smsIntern/sms-kadai/backend/api/get_organization_google"
	"smsIntern/sms-kadai/backend/db"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	dbPath := "kadai2.db"
	if err := db.InitDB(dbPath); err != nil {
		panic(err)
	}

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
		api.POST("/repository/create/batch", db_post.PostRepositoryBatch)                //リポジトリ保存
		api.POST("/file-or-dir/create/batch/:repo_id", file_dir_post.PostFileOrDirBatch) //ファイル・ディレクトリ保存
		api.DELETE("/db/delete-all", db_delete.DeleteAllDataHandler)
		// キャッシュ取得API: /api/db/fileordir/:repoId/*path
		api.GET("/db/fileordir/:repoId/*path", get_db_cash.HandleGetFileOrDirCache)
		api.GET("/db/repos", getdbrepository.HandleGetRepositoriesCache)
	}
	r.Run(":3030")
}
