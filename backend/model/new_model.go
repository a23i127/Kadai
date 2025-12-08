package model

import "time"

// User テーブル - ログイン機能
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"` // JSONには含めない
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Tag テーブル - ユーザー固有のタグ
type Tag struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	UserID uint   `gorm:"index;not null" json:"user_id"`
	Name   string `gorm:"not null" json:"name"`
	Color  string `gorm:"default:#3498db" json:"color"` // タグの色

	// 外部キー制約
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// 複合ユニークインデックス（同じユーザーが同じ名前のタグを複数作成できない）
	_ struct{} `gorm:"uniqueIndex:user_tag_name,user_id,name"`
}

// UserRepository テーブル - ユーザーとリポジトリの関連（お気に入り等）
type UserRepository struct {
	ID           uint `gorm:"primaryKey" json:"id"`
	UserID       uint `gorm:"index;not null" json:"user_id"`
	RepositoryID uint `gorm:"index;not null" json:"repository_id"`
	IsFavorite   bool `gorm:"default:false" json:"is_favorite"`

	// 外部キー制約
	User       User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Repository Repository `gorm:"foreignKey:RepositoryID" json:"repository,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// 複合ユニークインデックス（同じユーザーが同じリポジトリを複数回関連付けできない）
	_ struct{} `gorm:"uniqueIndex:user_repository,user_id,repository_id"`
}

// RepositoryTag テーブル - リポジトリとタグの多対多関係
type RepositoryTag struct {
	ID           uint `gorm:"primaryKey" json:"id"`
	UserID       uint `gorm:"index;not null" json:"user_id"`
	RepositoryID uint `gorm:"index;not null" json:"repository_id"`
	TagID        uint `gorm:"index;not null" json:"tag_id"`

	// 外部キー制約
	User       User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Repository Repository `gorm:"foreignKey:RepositoryID" json:"repository,omitempty"`
	Tag        Tag        `gorm:"foreignKey:TagID" json:"tag,omitempty"`

	CreatedAt time.Time `json:"created_at"`

	// 複合ユニークインデックス
	_ struct{} `gorm:"uniqueIndex:user_repo_tag,user_id,repository_id,tag_id"`
}

// 既存のRepository構造体を修正
type newRepository struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	Name          string `gorm:"index;not null" json:"name"`
	FullName      string `gorm:"uniqueIndex;not null" json:"full_name"`
	DefaultBranch string `json:"default_branch"`
	// Tag フィールドを削除（多対多関係で管理）
	Owner     Owner     `gorm:"embedded;embeddedPrefix:owner_" json:"owner"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
