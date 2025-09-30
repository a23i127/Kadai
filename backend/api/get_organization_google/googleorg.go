package get_organization_google

import (
	"io"
	"net/http"
	"smsIntern/sms-kadai/backend/auth"
	"strconv"

	"github.com/gin-gonic/gin"
)

var gh = &http.Client{}

// Google組織固定のリポジトリ一覧API
func ListGoogleRepos(c *gin.Context) {
	limit := c.DefaultQuery("limit", "10")
	page := c.DefaultQuery("page", "1")

	u := "https://api.github.com/orgs/google/repos?per_page=" + limit + "&page=" + page
	req, _ := http.NewRequest("GET", u, nil)
	auth.Auth(req)

	res, err := gh.Do(req)
	if err != nil {
		c.String(http.StatusBadGateway, err.Error())
		return
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		c.Data(res.StatusCode, "application/json", b)
		return
	}

	c.Header("Cache-Control", "public, max-age=60")
	io.Copy(c.Writer, res.Body)
}

// 2) 1階層のフォルダ/ファイル一覧

// 3) リポ全体ZIPをプロキシ
func ArchiveZip(c *gin.Context) {
	owner := c.Param("owner")
	repo := c.Param("repo")
	ref := c.DefaultQuery("ref", "main")

	u := "https://codeload.github.com/" + owner + "/" + repo + "/zip/refs/heads/" + ref
	req, _ := http.NewRequest("GET", u, nil)
	auth.Auth(req)

	res, err := gh.Do(req)
	if err != nil {
		c.String(http.StatusBadGateway, err.Error())
		return
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		c.Data(res.StatusCode, "application/octet-stream", b)
		return
	}

	c.Header("Content-Type", "application/zip")
	c.Header("Content-Disposition", "attachment; filename=\""+repo+"-"+ref+".zip\"")
	if res.ContentLength > 0 {
		c.Header("Content-Length", strconv.FormatInt(res.ContentLength, 10))
	}
	io.Copy(c.Writer, res.Body)
}
