/**
 * VRT キャプチャ時にのみ適用する CSS。
 *
 * textarea のリサイズハンドル (Chrome の ::-webkit-resizer) はスクロールバーと同じ
 * コンポジット層に描かれるため、キャプチャに含まれるかどうかが実行ごとに揺れる。
 * 待機を伸ばしても収束しないので、撮影中だけリサイズを無効化して差分要因から外す。
 */
export const argosCSS = `
	textarea {
		/* ページ側は .textarea クラスで指定しているため詳細度で勝てない。 */
		resize: none !important;
	}
`;
