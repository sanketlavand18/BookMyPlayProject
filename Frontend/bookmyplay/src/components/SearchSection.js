import { useState } from "react";

function SearchSection({ onSearch }) {

    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        onSearch(keyword);
    };

    return (

        <div className="container my-5">

            <div className="row justify-content-center">

                <div className="col-md-8">

                    <div className="input-group">

                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Search by Venue, Sport or City..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />

                        <button
                            className="btn btn-success"
                            onClick={handleSearch}
                        >
                            Search
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default SearchSection;