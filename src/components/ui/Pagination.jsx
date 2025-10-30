import PropTypes from "prop-types";

/**
 * Pagination component for navigating through pages
 *
 * @example
 * <Pagination
 *   currentPage={page}
 *   totalPages={10}
 *   onPageChange={setPage}
 *   showFirstLast
 * />
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const range = (start, end) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => start + idx);
  };

  const DOTS = "...";

  const paginationRange = () => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  };

  const pages = paginationRange();

  return (
    <div className={`pagination ${className}`}>
      {showFirstLast && (
        <button
          className="pagination-button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          type="button"
          aria-label="First page"
        >
          «
        </button>
      )}

      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        type="button"
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((pageNumber, idx) => {
        if (pageNumber === DOTS) {
          return (
            <span
              key={`dots-${pageNumber}-${idx}-${currentPage}`}
              className="pagination-dots"
            >
              {DOTS}
            </span>
          );
        }

        return (
          <button
            key={`page-${pageNumber}`}
            className={`pagination-button ${
              pageNumber === currentPage ? "active" : ""
            }`}
            onClick={() => onPageChange(pageNumber)}
            type="button"
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === currentPage ? "page" : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        type="button"
        aria-label="Next page"
      >
        ›
      </button>

      {showFirstLast && (
        <button
          className="pagination-button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          type="button"
          aria-label="Last page"
        >
          »
        </button>
      )}
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showFirstLast: PropTypes.bool,
  siblingCount: PropTypes.number,
  className: PropTypes.string,
};
