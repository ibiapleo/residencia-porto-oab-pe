package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.io.FilenameUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BalanceteCFOABImportService {

    private final BalanceteCFOABRepository balanceteCFOABRepository;
    private final ModelMapper modelMapper;
    private final DateTimeFormatter inputDateFormatter = DateTimeFormatter.ofPattern("M/d/yyyy");

    private final List<String> requiredHeaders = List.of(
            "Demonstrativo", "Referencia", "Ano", "Periodicidade", "PrevisaoEntrega"
    );

    @Transactional
    public List<BalanceteCFOABResponseDTO> importFromFile(MultipartFile file, User user) throws IOException {
        List<BalanceteCFOAB> validEntities = parseAndValidateFile(file, user);
        return saveValidEntities(validEntities);
    }

    private List<BalanceteCFOAB> parseAndValidateFile(MultipartFile file, User user) throws IOException {
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new IllegalArgumentException("Arquivo inválido ou não especificado");
        }

        try (InputStream inputStream = file.getInputStream()) {
            String extension = FilenameUtils.getExtension(file.getOriginalFilename()).toLowerCase();

            return switch (extension) {
                case "csv" -> parseCSV(inputStream, user);
                case "xlsx" -> parseXLSX(inputStream, user);
                default -> throw new IllegalArgumentException("Formato de arquivo não suportado: " + extension);
            };
        }
    }

    private List<BalanceteCFOAB> parseCSV(InputStream inputStream, User user) throws IOException {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setTrim(true)
                .build();

        try (CSVParser parser = new CSVParser(new InputStreamReader(inputStream), format)) {
            return parser.stream()
                    .map(record -> parseCSVRecord(record, user))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }
    }

    private BalanceteCFOAB parseCSVRecord(CSVRecord record, User user) {
        try {
            BalanceteCFOABRequestDTO dto = new BalanceteCFOABRequestDTO();


            dto.setDemonstracao(getCSVValue(record, "Demonstrativo"));
            dto.setReferencia(getCSVValue(record, "Referencia"));
            dto.setAno(getCSVValue(record, "Ano"));
            dto.setPeriodicidade(getCSVValue(record, "Periodicidade"));

            dto.setDtPrevEntr(parseDate(getCSVValue(record, "PrevisaoEntrega")));
            dto.setDtEntr(parseDate(getCSVValue(record, "DataEntrega")));

            validateDTO(dto);

            return createBalanceteFromDTO(dto, user);

        } catch (Exception e) {
            log.error("Erro na linha {}: {}", record.getRecordNumber(), e.getMessage());
            return null;
        }
    }

    private List<BalanceteCFOAB> parseXLSX(InputStream inputStream, User user) {
        List<BalanceteCFOAB> entities = new ArrayList<>();

        try (XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {
            XSSFSheet sheet = workbook.getSheetAt(0);
            Map<String, Integer> headers = parseHeaders(sheet.getRow(0));

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    BalanceteCFOABRequestDTO dto = new BalanceteCFOABRequestDTO();

                    dto.setDemonstracao(getCellValue(row, headers, "Demonstrativo"));
                    dto.setReferencia(getCellValue(row, headers, "Referencia"));
                    dto.setAno(getCellValue(row, headers, "Ano"));
                    dto.setPeriodicidade(getCellValue(row, headers, "Periodicidade"));

                    dto.setDtPrevEntr(parseDate(getCellValue(row, headers, "PrevisaoEntrega")));
                    dto.setDtEntr(parseDate(getCellValue(row, headers, "DataEntrega")));

                    validateDTO(dto);

                    entities.add(createBalanceteFromDTO(dto, user));

                } catch (Exception e) {
                    log.error("Erro na linha {}: {}", (i + 1), e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar arquivo XLSX", e);
        }

        return entities;
    }

    private BalanceteCFOAB createBalanceteFromDTO(BalanceteCFOABRequestDTO dto, User user) {
        BalanceteCFOAB balancete = modelMapper.map(dto, BalanceteCFOAB.class);
        balancete.setUser(user);
        balancete.setStatus(true);
        balancete.setEficiencia(balancete.getEficiencia());
        return balancete;
    }

    private List<BalanceteCFOABResponseDTO> saveValidEntities(List<BalanceteCFOAB> validEntities) {
        if (validEntities.isEmpty()) {
            return Collections.emptyList();
        }

        List<BalanceteCFOAB> savedEntities = balanceteCFOABRepository.saveAll(validEntities);

        return savedEntities.stream()
                .map(entity -> {
                    BalanceteCFOABResponseDTO response = modelMapper.map(entity, BalanceteCFOABResponseDTO.class);
                    response.setUsuarioId(entity.getUser().getId());
                    return response;
                })
                .collect(Collectors.toList());
    }

    private String getCSVValue(CSVRecord record, String header) {
        try {
            return record.get(header).trim();
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Cabeçalho não encontrado: " + header);
        }
    }

    private String getCellValue(Row row, Map<String, Integer> headers, String headerName) {
        Integer colIndex = headers.get(headerName);
        if (colIndex == null) return null;

        Cell cell = row.getCell(colIndex);
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toLocalDate().format(inputDateFormatter)
                    : String.valueOf((int) cell.getNumericCellValue());
            default -> null;
        };
    }

    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.isBlank()) return null;
        try {
            return LocalDate.parse(dateString, inputDateFormatter);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Data inválida: " + dateString + ". Formato esperado: M/d/aaaa");
        }
    }

    private Map<String, Integer> parseHeaders(Row headerRow) {
        Map<String, Integer> headers = new HashMap<>();
        for (Cell cell : headerRow) {
            headers.put(cell.getStringCellValue().trim(), cell.getColumnIndex());
        }
        validateHeaders(headers);
        return headers;
    }

    private void validateHeaders(Map<String, Integer> headers) {
        requiredHeaders.forEach(header -> {
            if (!headers.containsKey(header)) {
                throw new IllegalArgumentException("Cabeçalho obrigatório ausente: " + header);
            }
        });
    }

    private void validateDTO(BalanceteCFOABRequestDTO dto) {
        if (dto.getDemonstracao() == null || dto.getDemonstracao().isBlank()) {
            throw new IllegalArgumentException("Demonstrativo é obrigatório");
        }
        if (dto.getReferencia() == null || dto.getReferencia().isBlank()) {
            throw new IllegalArgumentException("Referência é obrigatória");
        }
        if (dto.getAno() == null || dto.getAno().isBlank()) {
            throw new IllegalArgumentException("Ano é obrigatório");
        }
        if (dto.getPeriodicidade() == null || dto.getPeriodicidade().isBlank()) {
            throw new IllegalArgumentException("Periodicidade é obrigatória");
        }
        if (dto.getDtPrevEntr() == null) {
            throw new IllegalArgumentException("Previsão de entrega é obrigatória");
        }
    }
}