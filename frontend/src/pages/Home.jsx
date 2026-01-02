import React from "react";
import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout title="Admin Dashboard" breadcrumb={["Home", "Dashboard"]}>
      <div className="dashboard-summery-one mg-b-20">
        <div className="row">
          <div className="col-12">
            <div className="card dashboard-card-one pd-b-20">
              <div className="card-body">
                <div className="heading-layout1">
                  <div className="item-title">
                    <h3>Welcome to Admin Dashboard</h3>
                  </div>
                </div>
                <p>Select a menu item from the sidebar to get started.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
