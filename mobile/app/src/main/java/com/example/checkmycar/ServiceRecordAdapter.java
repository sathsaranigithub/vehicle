package com.example.checkmycar;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;
import java.util.Map;

public class ServiceRecordAdapter extends RecyclerView.Adapter<ServiceRecordAdapter.ServiceRecordViewHolder> {

    private List<Map<String, Object>> maintenanceRecords;

    public ServiceRecordAdapter(List<Map<String, Object>> maintenanceRecords) {
        this.maintenanceRecords = maintenanceRecords;
    }

    @NonNull
    @Override
    public ServiceRecordViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_service_record, parent, false);
        return new ServiceRecordViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ServiceRecordViewHolder holder, int position) {
        Map<String, Object> record = maintenanceRecords.get(position);

        String date = (String) record.get("date");
        String serviceType = (String) record.get("serviceType");
        String costEstimation = (String) record.get("costEstimation");
        String serviceLocation = (String) record.get("serviceLocation");
        String serviceDescription = (String) record.get("serviceDescription");

        holder.dateTextView.setText("Serviced Date: " + date);
        holder.serviceTypeTextView.setText("Service Type: " + serviceType);
        holder.costEstimationTextView.setText("Payed Cost: " + costEstimation);
        holder.serviceLocationTextView.setText("Location: " + serviceLocation);
        holder.serviceDescriptionTextView.setText("Description: " + serviceDescription);
    }

    @Override
    public int getItemCount() {
        return maintenanceRecords.size();
    }

    public static class ServiceRecordViewHolder extends RecyclerView.ViewHolder {
        TextView dateTextView, serviceTypeTextView, costEstimationTextView, serviceLocationTextView, serviceDescriptionTextView;

        public ServiceRecordViewHolder(View itemView) {
            super(itemView);
            dateTextView = itemView.findViewById(R.id.dateTextView);
            serviceTypeTextView = itemView.findViewById(R.id.serviceTypeTextView);
            costEstimationTextView = itemView.findViewById(R.id.costEstimationTextView);
            serviceLocationTextView = itemView.findViewById(R.id.serviceLocationTextView);
            serviceDescriptionTextView = itemView.findViewById(R.id.serviceDescriptionTextView);
        }
    }
}
