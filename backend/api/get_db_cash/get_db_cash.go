package get_db_cash

import (
	"net/http"
	"strconv"
	"strings"

	"smsIntern/sms-kadai/backend/db"
	"smsIntern/sms-kadai/backend/model"

	"github.com/gin-gonic/gin"
)

// GET /api/db/fileordir/:repoId/*path
func HandleGetFileOrDirCache(c *gin.Context) {
	// パスパラメータ取得
	repoIdStr := c.Param("repoId")
	path := strings.TrimPrefix(c.Param("path"), "/")

	// repoIdをuintに変換
	repoID, err := strconv.ParseUint(repoIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repoId"})
		return
	}

	// DBから取得
	items, err := getFileOrDirFromDB(uint(repoID), path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

// 実際にDBを検索する処理
func getFileOrDirFromDB(repoID uint, rawPath string) ([]map[string]interface{}, error) {
	path := strings.TrimPrefix(rawPath, "/")

	// 正規化: ルートを空文字に統一
	if path == ":path" {
		path = ""
	}

	// 1) まず「そのpath自身」を探す（ファイル or ディレクトリ）
	var self model.FileOrDir
	if path != "" {
		if err := db.DB.
			Where("repo_id = ? AND path = ?", repoID, path).
			First(&self).Error; err == nil {
			// 見つかった
			if self.Type == "file" {
				// 2) ファイルなら1件のみ返す
				return []map[string]interface{}{
					{
						"fromCache": true,
						"name":      self.Name,
						"url":       self.URL,
						"type":      self.Type,
						"path":      self.Path,
						"content":   self.Content, // 取得済みならここに入ってる
					},
				}, nil
			}
			// 3) ディレクトリなら子一覧を返す
			var children []model.FileOrDir
			if err := db.DB.
				Where("repo_id = ? AND parent = ?", repoID, path).
				Find(&children).Error; err != nil {
				return nil, err
			}
			return toDTO(children), nil
		}
		// path指定だが自身が見つからない → 子一覧も0になるので空返す
		return []map[string]interface{}{}, nil
	}

	// 4) ルート（path==""）: 親が空のもの（NULL含む）を返す
	var rootItems []model.FileOrDir
	if err := db.DB.
		Where("repo_id = ? AND (parent = '' OR parent IS NULL)", repoID).
		Find(&rootItems).Error; err != nil {
		return nil, err
	}
	return toDTO(rootItems), nil
}

func toDTO(items []model.FileOrDir) []map[string]interface{} {
	out := make([]map[string]interface{}, 0, len(items))
	for _, it := range items {
		out = append(out, map[string]interface{}{
			"fromCache": true,
			"name":      it.Name,
			"url":       it.URL,
			"type":      it.Type,
			"path":      it.Path,
			"content":   it.Content,
		})
	}
	return out
}
