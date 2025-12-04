export default function InstagramFeed() {
  // For Instagram posts, you'll need to manually add the image URLs
  // Right-click on Instagram image in browser > "Open image in new tab" > Copy URL
  const posts = [
    {
      id: "DQ21nDokegk",
      url: "https://www.instagram.com/p/DQ21nDokegk/",
      image:
        "https://scontent.cdninstagram.com/v/t51.82787-15/579388617_17850907902584355_656091812733746632_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=Mzc2MjQzMDMwOTY5NTU5MTQ3OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTc5OC5zZHIuQzMifQ%3D%3D&_nc_ohc=cJu_qFEdid8Q7kNvwG83iSw&_nc_oc=AdkGuyRZhiUBFIJAUiBL0rkvbu1iJHaVI7moP5i05MlfNgjMPWmxCdNFznuCZWUMpOc&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=f3xL6XKvDiMC1SEsBSQpIQ&oh=00_AfgpwqDk231LwvdfBUwsLjDVopjsBzXxG9SiuVdNIel4Cg&oe=692569BD",
      caption: "Recent post from SLACC",
    },
    {
      id: "DQto7Knkd1Q",
      url: "https://www.instagram.com/p/DQto7Knkd1Q/",
      image:
        "https://scontent.cdninstagram.com/v/t51.82787-15/572098534_17850428751584355_2981966545568209914_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=Mzc1OTg0MTI0NjI0MTE5ODQ2Mw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=ve7DCcR5XNEQ7kNvwEjFRmN&_nc_oc=AdnTTQgmFD0ZBao2oKq8OzyK0NhWROognxsIAMHRLOKwwKGVOKAes96rNzIPpowcw5E&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=f3xL6XKvDiMC1SEsBSQpIQ&oh=00_AfjhGQ-EPuAkXbx51KVOSRxvx6iDiNc2KH9E0M5qlAXnhg&oe=69256D0C",
      caption: "Latest update from SLACC",
    },
    {
      id: "DQqA5zIobUI",
      url: "https://www.instagram.com/p/DQqA5zIobUI/",
      image:
        "https://scontent.cdninstagram.com/v/t51.82787-15/571743074_17850320978584355_2741083092391531825_n.jpg",
      caption: "SLACC community update",
    },
  ];

  return (
    <div
      className="instagram-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--spacing-4)",
        maxHeight: "300px",
        overflow: "hidden",
      }}
    >
      {posts.slice(0, 3).map(post => (
        <a
          key={post.id}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="card hover-lift instagram-card"
          style={{ height: "100%", maxHeight: "280px" }}
        >
          <div className="instagram-image-wrapper" style={{ height: "100%" }}>
            <img
              src={post.image}
              alt={post.caption}
              className="instagram-image"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="instagram-overlay">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="instagram-username">@slacc_cadera</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
