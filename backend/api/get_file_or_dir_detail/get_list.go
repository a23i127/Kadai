package get_file_or_dir_detail

import (
	"io"
	"net/http"
	"net/url"
	"smsIntern/sms-kadai/backend/auth"
	"strings"

	"github.com/gin-gonic/gin"
)

var gh = &http.Client{}

// ディレクトリ・ファイル両方に対応した汎用ハンドラ
func GetFileOrDirContents(c *gin.Context) {
	owner := c.Param("owner")
	repo := c.Param("repo")
	path := strings.TrimPrefix(c.Param("path"), "/")
	if path == "" || path == ":path" {
		path = ""
	}
	ref := c.DefaultQuery("ref", "master")

	var u string
	if path == "" {
		u = "https://api.github.com/repos/" + owner + "/" + repo + "/contents"
	} else {
		u = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + url.PathEscape(path)
	}
	if ref != "" {
		u += "?ref=" + url.QueryEscape(ref)
	}

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

	contentType := res.Header.Get("Content-Type")
	if strings.HasPrefix(contentType, "application/json") {
		b, _ := io.ReadAll(res.Body)
		c.Data(http.StatusOK, "application/json", b)
	} else {
		c.Header("Content-Type", contentType)
		io.Copy(c.Writer, res.Body)
	}
}
