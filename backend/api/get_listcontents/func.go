package get_listcontents

import (
	"io"
	"net/http"
	"smsIntern/sms-kadai/backend/auth"

	"github.com/gin-gonic/gin"
)

var gh = &http.Client{}

func ListContents(c *gin.Context) {
	owner := c.Param("owner")
	repo := c.Param("repo")
	path := c.DefaultQuery("path", "")
	ref := c.DefaultQuery("ref", "master") //これリポジトリごとに違う

	u := "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path
	if ref != "" {
		u += "?ref=" + ref
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

	c.Header("Cache-Control", "public, max-age=60")
	io.Copy(c.Writer, res.Body)
}
