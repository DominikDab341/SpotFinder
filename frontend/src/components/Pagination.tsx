import '../css/pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  return (
    <div className="pagination-bar">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn pagination-btn"
      >
        Previous
      </button>

      <span className="page-info">
        Page <strong>{currentPage}</strong> of {totalPages || 1}
      </span>

      <button
        disabled={currentPage >= totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn pagination-btn"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;