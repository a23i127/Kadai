package model

import "time"

type Repository struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	Name          string `gorm:"index;not null" json:"name"`
	FullName      string `gorm:"uniqueIndex;not null" json:"full_name"`
	DefaultBranch string `json:"default_branch"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// FileOrDir テーブル
type FileOrDir struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	RepoID uint `gorm:"index;not null;uniqueIndex:file_or_dir_repo_path" json:"repo_id"`

	Name string `gorm:"not null" json:"name"`
	Path string `gorm:"index;not null;uniqueIndex:file_or_dir_repo_path" json:"path"`
	Type string `gorm:"type:varchar(10);not null" json:"type"`

	URL         string `json:"url"`
	HTMLURL     string `json:"html_url"`
	DownloadURL string `json:"download_url"`

	SHA  string `json:"sha"` // ← ファイルの変更追跡や差分更新に便利
	Size int    `json:"size"`

	Content string `json:"content,omitempty"` // ファイル単体取得時のみセットされる
	Parent  string `gorm:"index" json:"parent"`

	FetchedAt time.Time `gorm:"autoCreateTime" json:"fetched_at"`
}
