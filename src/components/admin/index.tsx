export default function Admin() {
    return (
        <div class="dashboard-container">
            <h2>Admin Dashboard</h2>
            <ul class="admin-dashboard-list">
                <li>
                    <a href="/admin/categories">Categories</a>
                </li>
                <li>
                    <a href="/admin/poetry">Poetry</a>
                </li>
                <li>
                    <a href="/admin/categories">Works</a>
                </li>
            </ul>
        </div>
    )
}
