package org.portodigital.residencia.oabpe.domain.commons;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.io.FilenameUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
public abstract class AbstractFileImportService<T> {

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("M/d/yyyy");

    public List<Object> importFile(MultipartFile file, User user, ImportProcessor<T> processor) throws IOException {
        String extension = FilenameUtils.getExtension(file.getOriginalFilename()).toLowerCase();

        try (InputStream inputStream = file.getInputStream()) {
            return switch (extension) {
                case "csv" -> parseCSV(inputStream, processor, user);
                case "xlsx" -> parseXLSX(inputStream, processor, user);
                default -> throw new IllegalArgumentException("Formato não suportado: " + extension);
            };
        }
    }

    private List<Object> parseCSV(InputStream inputStream, ImportProcessor<T> processor, User user) throws IOException {
        CSVFormat format = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setTrim(true).build();

        try (CSVParser parser = new CSVParser(new InputStreamReader(inputStream), format)) {
            validateHeaders(parser.getHeaderMap().keySet(), processor.getRequiredHeaders());

            return parser.stream()
                    .map(record -> {
                        try {
                            Map<String, String> rowMap = record.toMap();
                            if (rowMap.values().stream().allMatch(String::isEmpty)) {
                                logError(record.getRecordNumber(), new IllegalArgumentException("Linha vazia"));
                                return null;
                            }
                            T dto = processor.parse(rowMap);
                            processor.validate(dto);
                            return processor.convertToEntity(dto, user);
                        } catch (Exception e) {
                            logError(record.getRecordNumber(), e);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .toList();
        }
    }

    private List<Object> parseXLSX(InputStream inputStream, ImportProcessor<T> processor, User user) {
        List<Object> result = new ArrayList<>();
        try (XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {
            XSSFSheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            Map<String, Integer> headers = getHeaders(headerRow);

            validateHeaders(headers.keySet(), processor.getRequiredHeaders());

            Iterator<Row> rowIterator = sheet.iterator();
            rowIterator.next();

            int rowIndex = 1;
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (row == null || isRowEmpty(row)) {
                    rowIndex++;
                    continue;
                }

                try {
                    Map<String, String> rowData = getRowData(row, headers);
                    if (rowData.values().stream().allMatch(String::isEmpty)) {
                        logError(rowIndex + 1, new IllegalArgumentException("Linha vazia"));
                        rowIndex++;
                        continue;
                    }
                    T dto = processor.parse(rowData);
                    processor.validate(dto);
                    result.add(processor.convertToEntity(dto, user));
                } catch (Exception e) {
                    logError(rowIndex + 1, e);
                }
                rowIndex++;
            }
        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar XLSX", e);
        }

        return result;
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (Cell cell : row) {
            if (cell != null) {
                String cellValue;
                switch (cell.getCellType()) {
                    case STRING -> cellValue = cell.getStringCellValue().trim();
                    case BLANK -> cellValue = "";
                    default -> cellValue = cell.toString().trim();
                }
                if (!cellValue.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private Map<String, Integer> getHeaders(Row headerRow) {
        Map<String, Integer> headers = new HashMap<>();
        for (Cell cell : headerRow) {
            headers.put(cell.getStringCellValue().trim(), cell.getColumnIndex());
        }
        return headers;
    }

    private Map<String, String> getRowData(Row row, Map<String, Integer> headers) {
        Map<String, String> rowData = new HashMap<>();
        headers.forEach((key, index) -> {
            Cell cell = row.getCell(index);
            if (cell != null) {
                switch (cell.getCellType()) {
                    case STRING -> rowData.put(key, cell.getStringCellValue().trim());
                    case NUMERIC -> {
                        if (DateUtil.isCellDateFormatted(cell)) {
                            rowData.put(key, cell.getLocalDateTimeCellValue().toLocalDate().format(dateFormatter));
                        } else {
                            rowData.put(key, String.valueOf((int) cell.getNumericCellValue()));
                        }
                    }
                    default -> rowData.put(key, "");
                }
            }
        });
        return rowData;
    }

    private void validateHeaders(Set<String> actual, String[] required) {
        for (String header : required) {
            if (!actual.contains(header)) {
                throw new IllegalArgumentException("Cabeçalho ausente: " + header);
            }
        }
    }

    private void logError(long line, Exception e) {
        log.error("Erro na linha {}: {}", line, e.getMessage());
    }
}