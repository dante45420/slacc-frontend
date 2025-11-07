export default function InstagramFeed() {
  // For Instagram posts, you'll need to manually add the image URLs
  // Right-click on Instagram image in browser > "Open image in new tab" > Copy URL
  const posts = [
    {
      id: "DQto7Knkd1Q",
      url: "https://www.instagram.com/p/DQto7Knkd1Q/",
      // Replace with actual image URL after opening in browser
      image:
        "https://scontent.cdninstagram.com/v/t51.82787-15/572098534_17850428751584355_2981966545568209914_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=Mzc1OTg0MTI0NjI0MTE5ODQ2Mw%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=KQgs8onPBhkQ7kNvwGhXagx&_nc_oc=AdkOAWGLV7TbH9eVQQAyLeaMzTweV4MiJnlGJx4EKxzC6JZO3e_LoUTvYe-JCFgga6A&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=UqPO25uPjzWYjrmw8C_dzw&oh=00_Afgfl7xT0LT9vIJqAuuAUrUY64fhoBRZMCKSV3SiHdbBvg&oe=6914114C",
      caption: "Recent post from SLACC",
    },
    {
      id: "DPCP558ivga",
      url: "https://www.instagram.com/p/DPCP558ivga/",
      // Replace with actual image URL after opening in browser
      image:
        "https://scontent.cdninstagram.com/v/t51.82787-15/553502192_17842890909584355_762588276760088701_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ig_cache_key=MzcyOTYxMzM5MTM0MzA1NjkyMg%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjExMjJ4MTEyMi5zZHIuQzMifQ%3D%3D&_nc_ohc=ekSWDyKJ_cUQ7kNvwHcTML1&_nc_oc=AdkxZcKcqHvig-HAsFQRbrDdX2So2FfBeON-0STuZ2QL0jDA7L2S6rKwFpjhSkU8_OQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=UqPO25uPjzWYjrmw8C_dzw&oh=00_AfiPBsCtuOY5q0OCH2f3aSmR3SrdXGoorviulpoQzYjd2Q&oe=6913EE74",
      caption: "Latest update from SLACC",
    },
  ];

  return (
    <div className="instagram-grid">
      {posts.map(post => (
        <a
          key={post.id}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="card hover-lift instagram-card"
        >
          <div className="instagram-image-wrapper">
            <img
              src={post.image}
              alt={post.caption}
              className="instagram-image"
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
